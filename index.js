const recursive = require("recursive-readdir");
const NodeID3 = require("node-id3");
const R = require("ramda");

const path = "/Users/saldin/Downloads/Da Gudda Jazz/";

recursive(path, (recursiveErr, files) => {
  if (recursiveErr != null) {
    console.error(recursiveErr);
  }

  R.map(file => {
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

      const filePathArr = R.pipe(
        R.replace(path, ""),
        R.split("/")
      )(file);
      const newTags = {
        artist: R.head(filePathArr),
        // 'Крайм Волшебник - Сеньорита' -> 'Сеньорита'
        title: R.ifElse(
          R.startsWith(`${R.head(filePathArr)} - `),
          R.replace(`${R.head(filePathArr)} - `, ""),
          R.identity
        )(R.last(filePathArr)),
        album: R.head(R.slice(-2, -1, filePathArr)) // name of the last folder
      };

      console.log(`\n${file}\n${JSON.stringify(newTags, null, 2)}`);

      NodeID3.write({ ...tags, ...newTags }, file);
    });
  }, files);
});
