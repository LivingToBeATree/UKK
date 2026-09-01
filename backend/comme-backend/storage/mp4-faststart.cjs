/**
 * MP4 FastStart - Moves the moov atom before mdat for web streaming.
 * This allows browsers to seek in videos without downloading the entire file.
 *
 * Usage: node mp4-faststart.js <input.mp4>
 * Overwrites the file in-place.
 */
const fs = require('fs');
const path = require('path');

function readBox(buf, offset) {
    if (offset + 8 > buf.length) return null;
    let size = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);

    // Handle extended size (64-bit)
    let headerSize = 8;
    if (size === 1 && offset + 16 <= buf.length) {
        // 64-bit size
        const hi = buf.readUInt32BE(offset + 8);
        const lo = buf.readUInt32BE(offset + 12);
        size = hi * 0x100000000 + lo;
        headerSize = 16;
    } else if (size === 0) {
        // Box extends to end of file
        size = buf.length - offset;
    }

    return { type, offset, size, headerSize };
}

function parseBoxes(buf) {
    const boxes = [];
    let offset = 0;
    while (offset < buf.length - 8) {
        const box = readBox(buf, offset);
        if (!box || box.size < 8) break;
        boxes.push(box);
        offset += box.size;
    }
    return boxes;
}

function faststart(filePath) {
    console.log(`Processing: ${filePath}`);
    const buf = fs.readFileSync(filePath);
    const boxes = parseBoxes(buf);

    console.log('Top-level boxes:', boxes.map(b => `${b.type}@${b.offset}(${b.size})`).join(', '));

    const moovIdx = boxes.findIndex(b => b.type === 'moov');
    const mdatIdx = boxes.findIndex(b => b.type === 'mdat');

    if (moovIdx < 0) {
        console.log('ERROR: No moov box found');
        return false;
    }
    if (mdatIdx < 0) {
        console.log('ERROR: No mdat box found');
        return false;
    }
    if (moovIdx < mdatIdx) {
        console.log('moov is already before mdat — no changes needed!');
        return true;
    }

    console.log(`moov is at index ${moovIdx} (offset ${boxes[moovIdx].offset}), mdat is at index ${mdatIdx} (offset ${boxes[mdatIdx].offset})`);
    console.log('Moving moov before mdat...');

    const moovBox = boxes[moovIdx];
    const moovData = buf.subarray(moovBox.offset, moovBox.offset + moovBox.size);
    const moovSize = moovBox.size;

    // Update chunk offsets inside moov — stco (32-bit) and co64 (64-bit) boxes
    // need their offsets increased by moovSize because we're inserting moov before mdat
    const moovBuf = Buffer.from(moovData);
    updateChunkOffsets(moovBuf, 0, moovBuf.length, moovSize);

    // Rebuild: [everything before mdat] + [moov] + [mdat and everything after, except original moov]
    const parts = [];

    // Everything before mdat
    if (boxes[mdatIdx].offset > 0) {
        parts.push(buf.subarray(0, boxes[mdatIdx].offset));
    }

    // Moved moov
    parts.push(moovBuf);

    // mdat and everything between mdat and moov
    parts.push(buf.subarray(boxes[mdatIdx].offset, moovBox.offset));

    // Everything after moov
    const afterMoov = moovBox.offset + moovBox.size;
    if (afterMoov < buf.length) {
        parts.push(buf.subarray(afterMoov));
    }

    const result = Buffer.concat(parts);
    console.log(`Original size: ${buf.length}, New size: ${result.length}`);

    // Verify
    const newBoxes = parseBoxes(result);
    console.log('New top-level boxes:', newBoxes.map(b => `${b.type}@${b.offset}(${b.size})`).join(', '));

    const newMoovIdx = newBoxes.findIndex(b => b.type === 'moov');
    const newMdatIdx = newBoxes.findIndex(b => b.type === 'mdat');
    if (newMoovIdx >= newMdatIdx) {
        console.log('ERROR: moov is still not before mdat after rewrite!');
        return false;
    }

    // Write back
    fs.writeFileSync(filePath, result);
    console.log('Done! moov is now before mdat.');
    return true;
}

function updateChunkOffsets(buf, start, end, delta) {
    let offset = start;
    while (offset < end - 8) {
        const box = readBox(buf, offset);
        if (!box || box.size < 8) break;

        if (box.type === 'stco') {
            // 32-bit chunk offset table
            const entryCount = buf.readUInt32BE(offset + box.headerSize + 4);
            let entryOffset = offset + box.headerSize + 8;
            for (let i = 0; i < entryCount && entryOffset + 4 <= offset + box.size; i++) {
                const oldVal = buf.readUInt32BE(entryOffset);
                buf.writeUInt32BE(oldVal + delta, entryOffset);
                entryOffset += 4;
            }
            console.log(`  Updated stco: ${entryCount} entries, +${delta} bytes`);
        } else if (box.type === 'co64') {
            // 64-bit chunk offset table
            const entryCount = buf.readUInt32BE(offset + box.headerSize + 4);
            let entryOffset = offset + box.headerSize + 8;
            for (let i = 0; i < entryCount && entryOffset + 8 <= offset + box.size; i++) {
                const hi = buf.readUInt32BE(entryOffset);
                const lo = buf.readUInt32BE(entryOffset + 4);
                const oldVal = hi * 0x100000000 + lo;
                const newVal = oldVal + delta;
                buf.writeUInt32BE(Math.floor(newVal / 0x100000000), entryOffset);
                buf.writeUInt32BE(newVal >>> 0, entryOffset + 4);
                entryOffset += 8;
            }
            console.log(`  Updated co64: ${entryCount} entries, +${delta} bytes`);
        } else if (['moov', 'trak', 'mdia', 'minf', 'stbl', 'edts'].includes(box.type)) {
            // Container boxes — recurse into children
            updateChunkOffsets(buf, offset + box.headerSize, offset + box.size, delta);
        }

        offset += box.size;
    }
}

// Run
const inputFile = process.argv[2];
if (!inputFile) {
    console.log('Usage: node mp4-faststart.js <file.mp4>');
    process.exit(1);
}
faststart(path.resolve(inputFile));
