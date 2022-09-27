import { PokesavDsGen5 } from 'pokesav-ds-gen5';
import { PokemonMetadata } from './savefile-modifier/black-white-1';

export function metadataFromPokesavObject(
  pokeSav: PokesavDsGen5.Pokemon
): PokemonMetadata {
  const language =
    PokesavDsGen5.CountryOfOrigin[
      pokeSav.blockA.originalLanguage
    ].toLowerCase();

  if (
    language !== 'japanese' &&
    language !== 'english' &&
    language !== 'french' &&
    language !== 'italian' &&
    language !== 'german' &&
    language !== 'spanish' &&
    language !== 'korean'
  ) {
    throw new Error(`Invalid language (should never happen), got: ${language}`);
  }

  return {
    name: pokeSav.blockC.nickname,
    species: pokeSav.blockA.nationalPokedexId,
    form: pokeSav.blockB.forme,
    isFemale: pokeSav.blockB.isFemale,
    isShiny: pokeSav.isShiny,
    language,
  };
}
