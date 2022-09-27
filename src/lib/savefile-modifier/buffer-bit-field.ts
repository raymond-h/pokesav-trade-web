function calculateBitIndex(bitIndex: number): [number, number] {
  const byteIndex = Math.floor(bitIndex / 8);
  const bitInByteIndex = bitIndex % 8;

  return [byteIndex, bitInByteIndex];
}

function setBitInByte(
  originalByte: number,
  bitInByteIndex: number,
  value: boolean
) {
  return !value
    ? originalByte & ~(1 << bitInByteIndex)
    : originalByte | (1 << bitInByteIndex);
}

export function setBitInBuffer(buf: Buffer, bitIndex: number, value: boolean) {
  const [byteIndex, bitInByteIndex] = calculateBitIndex(bitIndex);

  const originalByte = buf.readUInt8(byteIndex);
  const newByte = setBitInByte(originalByte, bitInByteIndex, value);
  buf.writeUInt8(newByte, byteIndex);
}

export function getBitInBuffer(buf: Buffer, bitIndex: number): boolean {
  const [byteIndex, bitInByteIndex] = calculateBitIndex(bitIndex);

  const originalByte = buf.readUInt8(byteIndex);

  return ((originalByte >> bitInByteIndex) & 0x1) !== 0;
}
