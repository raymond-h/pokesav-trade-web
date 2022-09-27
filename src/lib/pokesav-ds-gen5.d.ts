declare module 'pokesav-ds-gen5' {
  export class PokesavDsGen5 {}

  namespace PokesavDsGen5 {
    enum CountryOfOrigin {
      JAPANESE = 1,
      ENGLISH = 2,
      FRENCH = 3,
      ITALIAN = 4,
      GERMAN = 5,
      SPANISH = 7,
      KOREAN = 8,
    }

    class PokemonInParty {
      base: Pokemon;
    }

    class Pokemon {
      blockA: PokemonBlockA;
      blockB: PokemonBlockB;
      isShiny: boolean;
    }

    class PokemonBlockA {
      nationalPokedexId: number;
      originalLanguage: CountryOfOrigin;
    }

    class PokemonBlockB {
      forme: number;
      isFemale: boolean;
    }
  }
}
