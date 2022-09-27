import crc16ccitt from 'crc/crc16ccitt';
import { getBitInBuffer, setBitInBuffer } from './buffer-bit-field';

export function updateChecksums(file: Buffer) {
  const partyBuf = file.subarray(0x18e00, 0x18e00 + 0x534);
  const pokedexBuf = file.subarray(0x21600, 0x21600 + 0x4d4);
  const checksumBuf = file.subarray(0x23f00, 0x23f00 + 0x8c);

  // update party checksum
  const partyChecksum = crc16ccitt(partyBuf);
  file.writeUInt16LE(partyChecksum, 0x18e00 + 0x536);
  checksumBuf.writeUInt16LE(partyChecksum, 0x34);

  // update pokedex checksum
  const pokedexChecksum = crc16ccitt(pokedexBuf);
  file.writeUInt16LE(pokedexChecksum, 0x21600 + 0x4d6);
  checksumBuf.writeUInt16LE(pokedexChecksum, 0x6e);

  // update checksum block checksum
  const checksumBlockChecksum = crc16ccitt(checksumBuf);
  file.writeUInt16LE(checksumBlockChecksum, 0x23f00 + 0x9a);
}

export function getPokemonInParty(file: Buffer, partyIndex: number): Buffer {
  const partyBuf = file.subarray(0x18e00, 0x18e00 + 0x534);

  return partyBuf.subarray(
    0x8 + 220 * partyIndex,
    0x8 + 220 * (partyIndex + 1)
  );
}

export function setPokemonInParty(
  file: Buffer,
  partyIndex: number,
  newPokemonBuf: Buffer
) {
  const pokemonBuf = getPokemonInParty(file, partyIndex);

  newPokemonBuf.copy(pokemonBuf);

  updateChecksums(file);
}

const pokedexSpeciesBitfieldSubarray = (buf: Buffer, bitfieldIndex: number) =>
  buf.subarray(0x8 + 0x54 * bitfieldIndex, 0x8 + 0x54 * (bitfieldIndex + 1));

export function setPokedexSpeciesCaught(file: Buffer, speciesId: number) {
  const pokedexBuf = file.subarray(0x21600, 0x21600 + 0x4d4);
  const caughtBitfield = 0;

  setBitInBuffer(
    pokedexSpeciesBitfieldSubarray(pokedexBuf, caughtBitfield),
    speciesId - 1,
    true
  );

  updateChecksums(file);
}

export function setPokedexSpeciesSeen(
  file: Buffer,
  speciesId: number,
  isFemale: boolean,
  isShiny: boolean
) {
  const pokedexBuf = file.subarray(0x21600, 0x21600 + 0x4d4);
  const seenBitfield = 1 + (isFemale ? 1 : 0) + (isShiny ? 2 : 0);

  setBitInBuffer(
    pokedexSpeciesBitfieldSubarray(pokedexBuf, seenBitfield),
    speciesId - 1,
    true
  );

  updateChecksums(file);
}

export function setPokedexSpeciesDisplayed(
  file: Buffer,
  speciesId: number,
  isFemale: boolean,
  isShiny: boolean
) {
  const pokedexBuf = file.subarray(0x21600, 0x21600 + 0x4d4);

  for (let displayBitfield = 5; displayBitfield <= 8; displayBitfield++) {
    setBitInBuffer(
      pokedexSpeciesBitfieldSubarray(pokedexBuf, displayBitfield),
      speciesId - 1,
      false
    );
  }

  const displayBitfield = 4 + 1 + (isFemale ? 1 : 0) + (isShiny ? 2 : 0);

  setBitInBuffer(
    pokedexSpeciesBitfieldSubarray(pokedexBuf, displayBitfield),
    speciesId - 1,
    true
  );

  updateChecksums(file);
}

export function isPokedexSpeciesAnyDisplayed(
  file: Buffer,
  speciesId: number
): boolean {
  const pokedexBuf = file.subarray(0x21600, 0x21600 + 0x4d4);

  for (let displayBitfield = 5; displayBitfield <= 8; displayBitfield++) {
    if (
      getBitInBuffer(
        pokedexSpeciesBitfieldSubarray(pokedexBuf, displayBitfield),
        speciesId - 1
      )
    )
      return true;
  }

  return false;
}

function bitStartIndexForForm(speciesId: number) {
  // based on PKHeX data
  const x: Record<number, number> = {
    '201': 0, // 28 Unown
    '386': 28, // 4 Deoxys
    '492': 32, // 2 Shaymin
    '487': 34, // 2 Giratina
    '479': 36, // 6 Rotom
    '422': 42, // 2 Shellos
    '423': 44, // 2 Gastrodon
    '412': 46, // 3 Burmy
    '413': 49, // 3 Wormadam
    '351': 52, // 4 Castform
    '421': 56, // 2 Cherrim
    '585': 58, // 4 Deerling
    '586': 62, // 4 Sawsbuck
    '648': 66, // 2 Meloetta
    '555': 68, // 2 Darmanitan
    '550': 70, // 2 Basculin
  };

  return speciesId in x ? x[speciesId] : null;
}

function formCountForSpecies(speciesId: number) {
  // based on PKHeX data
  const x: Record<number, number> = {
    '201': 28, // Unown
    '386': 4, // Deoxys
    '492': 2, // Shaymin
    '487': 2, // Giratina
    '479': 6, // Rotom
    '422': 2, // Shellos
    '423': 2, // Gastrodon
    '412': 3, // Burmy
    '413': 3, // Wormadam
    '351': 4, // Castform
    '421': 2, // Cherrim
    '585': 4, // Deerling
    '586': 4, // Sawsbuck
    '648': 2, // Meloetta
    '555': 2, // Darmanitan
    '550': 2, // Basculin
  };

  return speciesId in x ? x[speciesId] : null;
}

const pokedexFormBitfieldSubarray = (buf: Buffer, formBitfield: number) =>
  buf.subarray(0x2fc + 9 * formBitfield, 0x2fc + 9 * (formBitfield + 1));

export function setPokedexFormSeen(
  file: Buffer,
  speciesId: number,
  formId: number,
  isShiny: boolean
) {
  const pokedexBuf = file.subarray(0x21600, 0x21600 + 0x4d4);

  const startingBitIndex = bitStartIndexForForm(speciesId);
  if (startingBitIndex == null) {
    throw new Error('Only certain species with alternate forms can be passed');
  }

  const formBitfield = isShiny ? 1 : 0;

  setBitInBuffer(
    pokedexFormBitfieldSubarray(pokedexBuf, formBitfield),
    startingBitIndex + formId,
    true
  );

  updateChecksums(file);
}

export function setPokedexFormDisplayed(
  file: Buffer,
  speciesId: number,
  formId: number,
  isShiny: boolean
) {
  const pokedexBuf = file.subarray(0x21600, 0x21600 + 0x4d4);

  const startingBitIndex = bitStartIndexForForm(speciesId);
  const formCount = formCountForSpecies(speciesId);
  if (startingBitIndex == null || formCount == null) {
    throw new Error('Only certain species with alternate forms can be passed');
  }

  for (let formId = 0; formId < formCount; formId++) {
    setBitInBuffer(
      pokedexFormBitfieldSubarray(pokedexBuf, 2), // display normal
      startingBitIndex + formId,
      false
    );
    setBitInBuffer(
      pokedexFormBitfieldSubarray(pokedexBuf, 3), // display shiny
      startingBitIndex + formId,
      false
    );
  }

  const formBitfield = 2 + (isShiny ? 1 : 0);

  setBitInBuffer(
    pokedexFormBitfieldSubarray(pokedexBuf, formBitfield),
    startingBitIndex + formId,
    true
  );

  updateChecksums(file);
}

export function isPokedexFormAnyDisplayed(
  file: Buffer,
  speciesId: number
): boolean {
  const pokedexBuf = file.subarray(0x21600, 0x21600 + 0x4d4);

  const startingBitIndex = bitStartIndexForForm(speciesId);
  const formCount = formCountForSpecies(speciesId);
  if (startingBitIndex == null || formCount == null) {
    throw new Error('Only certain species with alternate forms can be passed');
  }

  for (let formId = 0; formId < formCount; formId++) {
    if (
      getBitInBuffer(
        pokedexFormBitfieldSubarray(pokedexBuf, 2), // display normal
        startingBitIndex + formId
      ) ||
      getBitInBuffer(
        pokedexFormBitfieldSubarray(pokedexBuf, 3), // display shiny
        startingBitIndex + formId
      )
    )
      return true;
  }

  return false;
}

export type Language =
  | 'japanese'
  | 'english'
  | 'french'
  | 'italian'
  | 'german'
  | 'spanish'
  | 'korean';

const languagePokedexIds: Record<Language, number> = {
  japanese: 0,
  english: 1,
  french: 2,
  italian: 3,
  german: 4,
  spanish: 5,
  korean: 6,
};

export function setPokedexLanguageCaught(
  file: Buffer,
  speciesId: number,
  language: Language
) {
  if (speciesId > 493) {
    throw new Error(
      'Pokedex only tracks languages for Pokemon from gen 4 or earlier'
    );
  }

  const pokedexBuf = file.subarray(0x21600, 0x21600 + 0x4d4);

  setBitInBuffer(
    pokedexBuf.subarray(0x320, 0x320 + 432),
    (speciesId - 1) * 7 + languagePokedexIds[language],
    true
  );

  updateChecksums(file);
}

export interface PokemonMetadata {
  species: number;
  isFemale: boolean;
  isShiny: boolean;
  form: number;
  language: Language;
}

export function updatePokedexMarkPokemonAsCaught(
  file: Buffer,
  { species, isFemale, isShiny, form, language }: PokemonMetadata
) {
  setPokedexSpeciesCaught(file, species);

  setPokedexSpeciesSeen(file, species, isFemale, isShiny);
  if (!isPokedexSpeciesAnyDisplayed(file, species)) {
    setPokedexSpeciesDisplayed(file, species, isFemale, isShiny);
  }

  if (formCountForSpecies(species) != null) {
    setPokedexFormSeen(file, species, form, isShiny);
    if (!isPokedexFormAnyDisplayed(file, species)) {
      setPokedexFormDisplayed(file, species, form, isShiny);
    }
  }

  if (species <= 493) {
    setPokedexLanguageCaught(file, species, language);
  }
}

export function injectPokemonAsIfByTrading(
  file: Buffer,
  partyIndex: number,
  rawPokemonBuffer: Buffer,
  pokemonMetadata: PokemonMetadata
) {
  setPokemonInParty(file, partyIndex, rawPokemonBuffer);

  // TODO: egg met location?

  updatePokedexMarkPokemonAsCaught(file, pokemonMetadata);
}
