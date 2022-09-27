require('ts-node/register');

const fs = require('fs');
const path = require('path');
const { bw } = require('./src/lib/savefile-modifier/index');
const { metadataFromPokesavObject } = require('./src/lib/savefile-pokesav-compatibility-black-white-1');
const kaitaiStruct = require('kaitai-struct');
const { PokesavDsGen5 } = require('pokesav-ds-gen5');

const snivy = Buffer.from(`
+RJfsQAATMQEW/wvsFq4NfX9kXts1o/+9S35ozdT3WpqvELsj/j3VeckqrVcXOO79XMX98ENbZ72
ie5mCh5OGSKmoQckOIq2WN72SgC75lr280c7Ec3JtbLsNz2SaWJUrtb2tFQgCmMVBCOMW4PrFenm
PPOuXhI9PKBaPkDemZaPoS330TgIE9lieY4oUFQTzBC9QF+qlc5ErkpO4q4i4b2hOvKAir7j6di/
1hU/hCvqt2idmE9HOohei14ifWNF4T6vjFWDWVZSH8266Dafj4jGvBCBRmbQ3bChZQ==
`, 'base64');

const parsedSnivy = new PokesavDsGen5.PokemonInParty(new kaitaiStruct.KaitaiStream(snivy));
const snivyMetadata = metadataFromPokesavObject(parsedSnivy);

console.log(snivyMetadata);

//*
const originalFile = fs.readFileSync(process.argv[2]);

const file = originalFile.subarray(0x0, 0x24000);

// bw.setPokemonInParty(file, 0, snivy);
bw.injectPokemonAsIfByTrading(file, 0, snivy, snivyMetadata);

// let's try to add Shiny Dialga (seen) to pokedex
const dialgaSpeciesId = 483;

bw.setPokedexSpeciesSeen(file, dialgaSpeciesId, false, true);
bw.setPokedexSpeciesDisplayed(file, dialgaSpeciesId, false, true);

// let's try to add Shiny Giratina (seen, Origin Forme) to pokedex
const giratinaSpeciesId = 487;
const giratinaOriginFormeId = 1;

bw.setPokedexSpeciesSeen(file, giratinaSpeciesId, false, true);
bw.setPokedexSpeciesDisplayed(file, giratinaSpeciesId, false, true);

bw.setPokedexFormSeen(file, giratinaSpeciesId, giratinaOriginFormeId, true);
bw.setPokedexFormDisplayed(file, giratinaSpeciesId, giratinaOriginFormeId, true);

const beldumSpeciesId = 374;

bw.setPokedexLanguageCaught(file, beldumSpeciesId, 'french');
bw.setPokedexLanguageCaught(file, beldumSpeciesId, 'german');
bw.setPokedexLanguageCaught(file, beldumSpeciesId, 'japanese');

const newFilename = path.join(path.dirname(process.argv[2]), `${path.basename(process.argv[2], '.sav')}.modded.sav`);
fs.writeFileSync(newFilename, originalFile);
//*/
