# Changed bytes in savefile
Other pieces of data that has to change when a party mon is changed (AKA when its entry is different), with some details from `pokesav-ds-gen5.ksy`:

- Party checksum - `party_pokemon_block.checksum` - CRC16_CCITT
- Party checksum located within checksum block (`checksum_block.party_pokemon_checksum`) - just plain copied from above

## If Pokedex is changed

- Pokedex checksum - `pokedex_block.checksum` - CRC16_CCITT
- Pokedex checksum located within checksum block - `checksum_block.pokedex_checksum` - just plain copied from above

## Checksum block's checksum (if anything above is changed, then this is also changed)

- Checksum of entire checksum block - `checksum_block.checksum` - CRC16_CCITT

# Pokemon properties that are modified on trade

- If it's an egg, its `met location` changes to indicate it was received in a trade

# Other things that change on trade

- Pokedex (details at `SetDex(PKM pk)` in `Zukan5.cs` in PKHeX)
  - Caught flag
  - Seen flags
  - Display flags

For the Pokedex, apparently there's a series of bitfields, `0x54` (84) bytes in length (`84 * 8 = 672`, certainly enough to track one bit per species of which there are 649 in BW).

The bitfields I know so far are laid out as such:
- Caught
- Seen (male)
- Seen (female)
- Seen (male, shiny)
- Seen (female, shiny)
- Display male?
- Display female?
- Display shiny male?
- Display shiny female?

Genderless are treated as if male.

All the "Display ...?" ones should be mutually exclusive per species, and are used for determining whether to show a mon as male or female, and shiny or normal, in the Pokedex, I guess.

Forms have their own bitfields, explicitly only covering the mons that have alternate forms - all mons without alternate forms have no flag whatsoever here.

Forms bitfields:
- Seen (non-shiny)
- Seen (shiny)
- Display non-shiny?
- Display shiny?

As with the species bitfields, the "Display ...?" ones are mutually exclusive.

And then there's apparently a bitfield per species and language, to indicate which language a mon you got came from. And this is explicitly only a thing for all mons before gen 5 itself.
