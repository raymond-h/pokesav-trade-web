declare module 'pokesav-ds-gen5' {
  import { Buffer } from 'buffer';
  import * as kaitaiStruct from 'kaitai-struct';

  function fromBuffer(buffer: Buffer): PokesavDsGen5;

  class PokesavDsGen5 {
    blackWhiteChecksumBlock: PokesavDsGen5.ChecksumBlock;
    black2White2ChecksumBlock: PokesavDsGen5.ChecksumBlock;
    isBlackWhite: boolean;
    isBlack2White2: boolean;
    checksumBlock: PokesavDsGen5.ChecksumBlock;
    game: PokesavDsGen5.Game;
    partyPokemonBlock: PokesavDsGen5.PartyPokemonBlock;
    trainerDataBlock: PokesavDsGen5.TrainerDataBlock;
    cardSignatureBadgeBlock: PokesavDsGen5.CardSignatureBadgeBlock;
    adventureDataBlock: PokesavDsGen5.AdventureDataBlock;
    extraTrainerDataBlock: PokesavDsGen5.ExtraTrainerDataBlock;
    pokedexBlock: PokesavDsGen5.PokedexBlock;
  }

  namespace PokesavDsGen5 {
    enum Game {
      UNKNOWN = 0,
      HEART_GOLD_SOUL_SILVER = 8,
      DIAMOND_PEARL = 10,
      PLATINUM = 12,
      BLACK_WHITE = 20,
      BLACK_2_WHITE_2 = 22,
    }

    enum TrainerGender {
      MALE = 0,
      FEMALE = 1,
    }

    enum CountryOfOrigin {
      JAPANESE = 1,
      ENGLISH = 2,
      FRENCH = 3,
      ITALIAN = 4,
      GERMAN = 5,
      SPANISH = 7,
      KOREAN = 8,
    }

    enum MultiplayerAvatar {
      NONE = 0,
      ACE_TRAINER_MALE = 1,
      PKMN_RANGER_MALE = 2,
      PKMN_BREEDER_MALE = 3,
      SCIENTIST_MALE = 4,
      HIKER = 5,
      ROUGHNECK = 6,
      PRESCHOOLER_MALE = 7,
      LASS = 8,
      ACE_TRAINER_FEMALE = 9,
      PKMN_RANGER_FEMALE = 10,
      PKMN_BREEDER_FEMALE = 11,
      SCIENTIST_FEMALE = 12,
      PARASOL_LADY = 13,
      NURSE = 14,
      PRESCHOOLER_FEMALE = 15,
    }

    enum PokemonBlockOrder {
      ABCD = 0,
      ABDC = 1,
      ACBD = 2,
      ACDB = 3,
      ADBC = 4,
      ADCB = 5,
      BACD = 6,
      BADC = 7,
      BCAD = 8,
      BCDA = 9,
      BDAC = 10,
      BDCA = 11,
      CABD = 12,
      CADB = 13,
      CBAD = 14,
      CBDA = 15,
      CDAB = 16,
      CDBA = 17,
      DABC = 18,
      DACB = 19,
      DBAC = 20,
      DBCA = 21,
      DCAB = 22,
      DCBA = 23,
    }

    enum PokemonInverseBlockOrder {
      ABCD = 0,
      ABDC = 1,
      ACBD = 2,
      ADBC = 3,
      ACDB = 4,
      ADCB = 5,
      BACD = 6,
      BADC = 7,
      CABD = 8,
      DABC = 9,
      CADB = 10,
      DACB = 11,
      BCAD = 12,
      BDAC = 13,
      CBAD = 14,
      DBAC = 15,
      CDAB = 16,
      DCAB = 17,
      BCDA = 18,
      BDCA = 19,
      CBDA = 20,
      DBCA = 21,
      CDBA = 22,
      DCBA = 23,
    }

    enum Nature {
      HARDY = 0,
      LONELY = 1,
      BRAVE = 2,
      ADAMANT = 3,
      NAUGHTY = 4,
      BOLD = 5,
      DOCILE = 6,
      RELAXED = 7,
      IMPISH = 8,
      LAX = 9,
      TIMID = 10,
      HASTY = 11,
      SERIOUS = 12,
      JOLLY = 13,
      NAIVE = 14,
      MODEST = 15,
      MILD = 16,
      QUIET = 17,
      BASHFUL = 18,
      RASH = 19,
      CALM = 20,
      GENTLE = 21,
      SASSY = 22,
      CAREFUL = 23,
      QUIRKY = 24,
    }

    enum Pokeball {
      MASTER_BALL = 1,
      ULTRA_BALL = 2,
      GREAT_BALL = 3,
      POKE_BALL = 4,
      SAFARI_BALL = 5,
      NET_BALL = 6,
      DIVE_BALL = 7,
      NEST_BALL = 8,
      REPEAT_BALL = 9,
      TIMER_BALL = 10,
      LUXURY_BALL = 11,
      PREMIER_BALL = 12,
      DUSK_BALL = 13,
      HEAL_BALL = 14,
      QUICK_BALL = 15,
      CHERISH_BALL = 16,
    }

    enum HgssPokeball {
      FAST_BALL = 236,
      LEVEL_BALL = 237,
      LURE_BALL = 238,
      HEAVY_BALL = 239,
      LOVE_BALL = 240,
      FRIEND_BALL = 241,
      MOON_BALL = 242,
      COMPETITION_BALL = 243,
      PARK_BALL = 244,
    }

    class TrainerDataBlock {
      junk: Buffer;
      trainerName: string;
      trainerId: number;
      secretId: number;
      multiplayerAvatar: MultiplayerAvatar;
      trainerGender: TrainerGender;
      playtime: Playtime;
      totalPlaytimeSeconds: number;
      checksum: number;
    }

    class Playtime {
      hours: number;
      minutes: number;
      seconds: number;
    }

    class PartyPokemonBlock {
      junk: Buffer;
      partyPokemonCount: number;
      partyPokemon: Array<PokemonInParty>;
      checksum: number;
    }

    class ChecksumBlock {
      partyPokemonChecksum: number;
      trainerDataChecksum: number;
      pokedexChecksum: number;
      checksum: number;
    }

    class PokemonInParty {
      base: Pokemon;
      battleStats: PokemonBattleStats;
    }

    class Pokemon {
      constructor(kaitaiStream: kaitaiStruct.KaitaiStream);

      personalityValue: number;
      junk: Buffer;
      checksum: number;
      data: PokemonData;
      blockOrder: PokemonBlockOrder;
      blockA: Pokemon['data']['blockA'];
      blockB: Pokemon['data']['blockB'];
      blockC: Pokemon['data']['blockC'];
      blockD: Pokemon['data']['blockD'];
      isShiny: boolean;
    }

    class PokemonData {
      blockA: PokemonBlockA;
      blockB: PokemonBlockB;
      blockC: PokemonBlockC;
      blockD: PokemonBlockD;
    }

    class PokemonBlockA {
      nationalPokedexId: number;
      heldItem: number;
      originalTrainerId: number;
      originalTrainerSecretId: number;
      experiencePoints: number;
      friendship: number;
      ability: number;
      markings: number;
      originalLanguage: CountryOfOrigin;
      ev: Evs;
      contestValues: Buffer;
      sinnohRibbonSet1: number;
      sinnohRibbonSet2: number;
    }

    class Evs {
      hp: number;
      attack: number;
      defense: number;
      speed: number;
      specialAttack: number;
      specialDefense: number;
    }

    class PokemonBlockB {
      moves: [number, number, number, number];
      movePps: [number, number, number, number];
      movePpUps: [number, number, number, number];
      iv: Ivs;
      hoennRibbonSet1: number;
      hoennRibbonSet2: number;
      forme: number;
      isGenderless: boolean;
      isFemale: boolean;
      fatefulEncounter: boolean;
      nature: Nature;
      unused: number;
      nsPokemon: boolean;
      hasHiddenAbility: boolean;
      unused2: boolean;
      unused3: Buffer;
      platinumEggLocation: number;
      platinumMetAtLocation: number;
      isEgg: PokemonBlockB['iv']['isEgg'];
      isNicknamed: PokemonBlockB['iv']['isNicknamed'];
    }

    class Ivs {
      flags: number;
      hp: number;
      attack: number;
      defense: number;
      speed: number;
      specialAttack: number;
      specialDefense: number;
      isEgg: boolean;
      isNicknamed: boolean;
    }

    class PokemonBlockC {
      nickname: string;
      unused: number;
      originGame: Game;
      sinnohRibbonSet3: number;
      sinnohRibbonSet4: number;
      unused2: Buffer;
    }

    class PokemonBlockD {
      originalTrainerName: string;
      dateEggReceived: Buffer;
      dateMet: Buffer;
      diamondPearlEggLocation: number;
      diamondPearlMetAtLocation: number;
      pokerus: number;
      pokeball: Pokeball;
      originalTrainerGender: TrainerGender;
      metAtLevel: number;
      encounterType: number;
      hgssPokeball: HgssPokeball;
      unused: number;
    }

    class PokemonBattleStats {
      asleepTurnCount: number;
      isPoisoned: boolean;
      isBurned: boolean;
      isFrozen: boolean;
      isParalyzed: boolean;
      isToxic: boolean;
      unknown: Buffer;
      level: number;
      capsuleIndex: number;
      currentHp: number;
      stats: PokemonStats;
      mailMessage: Buffer;
      unused: Buffer;
    }

    class PokemonStats {
      hp: number;
      attack: number;
      defense: number;
      speed: number;
      specialAttack: number;
      specialDefense: number;
    }

    class CardSignatureBadgeBlock {
      trainerCardSignature: Buffer;
      trainerNature: Nature;
    }

    class AdventureDataBlock {
      adventureStartTime: number;
      leagueChampTime: number;
    }

    class ExtraTrainerDataBlock {
      money: number;
      badgeFlags: number;
    }

    class PokedexBlock {
      junk1: Buffer;
      species: PokedexBlock.SpeciesBitfieldGroup;
      forms: PokedexBlock.FormsBitfieldGroup;
      languages: PokedexBlock.SpeciesLanguageBitfield;
      junk2: Buffer;
      checksum: number;
    }

    namespace PokedexBlock {
      class SpeciesBitfieldGroup {
        caught: SpeciesBitfield;
        seenMaleGenderless: SpeciesBitfield;
        seenFemale: SpeciesBitfield;
        seenMaleGenderlessShiny: SpeciesBitfield;
        seenFemaleShiny: SpeciesBitfield;
        displayMaleGenderless: SpeciesBitfield;
        displayFemale: SpeciesBitfield;
        displayMaleGenderlessShiny: SpeciesBitfield;
        displayFemaleShiny: SpeciesBitfield;
      }

      class SpeciesBitfield {
        species: Array<boolean>;
      }

      class FormsBitfieldGroup {
        seen: FormsBitfield;
        seenShiny: FormsBitfield;
        display: FormsBitfield;
        displayShiny: FormsBitfield;
      }

      class FormsBitfield {
        unown: Array<boolean>;
        deoxys: [boolean, boolean, boolean, boolean];
        shaymin: [boolean, boolean];
        giratina: [boolean, boolean];
        rotom: [boolean, boolean, boolean, boolean, boolean, boolean];
        shellos: [boolean, boolean];
        gastrodon: [boolean, boolean];
        burmy: [boolean, boolean, boolean];
        wormadam: [boolean, boolean, boolean];
        castform: [boolean, boolean, boolean, boolean];
        cherrim: [boolean, boolean];
        deerling: [boolean, boolean, boolean, boolean];
        sawsbuck: [boolean, boolean, boolean, boolean];
        meloetta: [boolean, boolean];
        darmanitan: [boolean, boolean];
        basculin: [boolean, boolean];
        kyurem: [boolean, boolean, boolean];
        keldeo: [boolean, boolean];
        thundurus: [boolean, boolean];
        tornadus: [boolean, boolean];
        landorus: [boolean, boolean];
      }

      class SpeciesLanguageBitfield {
        species: Array<LanguageBitfield>;
      }

      class LanguageBitfield {
        japanese: boolean;
        english: boolean;
        french: boolean;
        italian: boolean;
        german: boolean;
        spanish: boolean;
        korean: boolean;
      }
    }
  }
}
