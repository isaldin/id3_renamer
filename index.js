const recursive = require("recursive-readdir");
const NodeID3 = require("node-id3");
const {
  map,
  replace,
  split,
  pipe,
  head,
  last,
  ifElse,
  identity,
  startsWith,
  slice
} = require("ramda");

const path = "/Users/saldin/Downloads/Da Gudda Jazz/";

recursive(path, (recursiveErr, files) => {
  if (recursiveErr != null) {
    console.error(recursiveErr);
  }

  map(file => {
    NodeID3.read(file, (err, tags) => {
      if (err != null) {
        console.error(err);
      }

      /*
        'Tanir/Треки/Tanir (Da Gudda Jazz) - Надейся на себя (feat. Gazo & Arab MC & Знако).mp3'
        becomes `{
          artist: 'Tanir', 
          title: 'Tanir (Da Gudda Jazz) - Надейся на себя (feat. Gazo & Arab MC & Знако)', 
          album: 'Треки',
        }`

        'Tanir/Баттлы/(2010-2011) InDaBattle's/(2010) InDaBattle II/7 Раунд - Небо падет на Землю с незримых высот.mp3'
        becomes `{
          artist: 'Tanir', 
          title: '7 Раунд - Небо падет на Землю с незримых высот', 
          album: '(2010) InDaBattle II',
        }`
      */

      const filePathArr = pipe(
        replace(path, ""),
        split("/")
      )(file);
      const newTags = {
        artist: head(filePathArr),
        // 'Крайм Волшебник - Сеньорита' -> 'Сеньорита'
        title: ifElse(
          startsWith(`${head(filePathArr)} - `),
          replace(`${head(filePathArr)} - `, ""),
          identity
        )(last(filePathArr)),
        album: head(slice(-2, -1, filePathArr)) // name of the last folder
      };

      console.log(`\n${file}\n${JSON.stringify(newTags, null, 2)}`);

      NodeID3.write({ ...tags, ...newTags }, file);
    });
  }, files);
});
