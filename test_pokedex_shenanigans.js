require('ts-node/register');

const fs = require('fs');
const path = require('path');
const crc16ccitt = require('crc/crc16ccitt');
const { bw } = require('./src/lib/savefile-modifier/index');
const { setBitInBuffer } = require('./src/lib/savefile-modifier/buffer-bit-field');

const originalFile = fs.readFileSync(process.argv[2]);

//*
const file = originalFile.subarray(0x0, 0x24000);

const partyBuf = file.subarray(0x18E00, 0x18E00 + 0x534);
const pokedexBuf = file.subarray(0x21600, 0x21600 + 0x4D4);

const firstPokemonBuf = partyBuf.subarray(0x8, 0x8 + 220);
const pkmn = Buffer.from(`
+RJfsQAATMQEW/wvsFq4NfX9kXts1o/+9S35ozdT3WpqvELsj/j3VeckqrVcXOO79XMX98ENbZ72
ie5mCh5OGSKmoQckOIq2WN72SgC75lr280c7Ec3JtbLsNz2SaWJUrtb2tFQgCmMVBCOMW4PrFenm
PPOuXhI9PKBaPkDemZaPoS330TgIE9lieY4oUFQTzBC9QF+qlc5ErkpO4q4i4b2hOvKAir7j6di/
1hU/hCvqt2idmE9HOohei14ifWNF4T6vjFWDWVZSH8266Dafj4jGvBCBRmbQ3bChZQ==
`, 'base64');
pkmn.copy(firstPokemonBuf);

// let's try to add Shiny Dialga (seen) to pokedex
const bitfieldStart = (bitfieldIndex) => 0x8 + 0x54 * bitfieldIndex;
const bitfieldEnd = (bitfieldIndex) => 0x8 + 0x54 * (bitfieldIndex + 1);
const pokedexBitfieldSubarray = (buf, bitfieldIndex) =>
  buf.subarray(
    bitfieldStart(bitfieldIndex), bitfieldEnd(bitfieldIndex)
  );

const speciesId = 483;
const seenMaleGenderlessShiny = 3;
const displayMaleGenderlessShiny = 7;

setBitInBuffer(pokedexBitfieldSubarray(pokedexBuf, seenMaleGenderlessShiny), speciesId - 1, true);
setBitInBuffer(pokedexBitfieldSubarray(pokedexBuf, displayMaleGenderlessShiny), speciesId - 1, true);

bw.updateChecksums(file);

const newFilename = path.join(path.dirname(process.argv[2]), `${path.basename(process.argv[2], '.sav')}.modded.sav`);
fs.writeFileSync(newFilename, originalFile);
//*/
