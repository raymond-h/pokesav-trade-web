import { PokesavDsGen5 } from 'pokesav-ds-gen5';
import { PokemonMetadata } from './savefile-modifier/black-white-1';

export function metadataFromPokesavObject(
  pokeSav: PokesavDsGen5.PokemonInParty
): PokemonMetadata {
  const language =
    PokesavDsGen5.CountryOfOrigin[pokeSav.base.blockA.originalLanguage];

  if (
    language !== 'japanese' &&
    language !== 'english' &&
    language !== 'french' &&
    language !== 'italian' &&
    language !== 'german' &&
    language !== 'spanish' &&
    language !== 'korean'
  ) {
    throw new Error('Invalid language (should never happen)');
  }

  return {
    species: pokeSav.base.blockA.nationalPokedexId,
    form: pokeSav.base.blockB.forme,
    isFemale: pokeSav.base.blockB.isFemale,
    isShiny: pokeSav.base.isShiny,
    language,
  };
}
