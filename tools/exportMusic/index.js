const fs = require("fs");
const path = require("path");

const config = require("../../config/configLoader.js");
const argv = require("yargs").argv;
const sequelize = require("sequelize");
const sanitize = require("sanitize-filename");
const { EventStart, EventStartMusic } = require("../../models/index.js");

async function main() {
  const targetPath = argv.output || "~/musicExport";
  console.log(`exporting to ${targetPath}`);
  const starts = await EventStart.findAll({
    where: {
      orderPosition: {
        [sequelize.Op.not]: null
      }
    },
    include: [
      {
        model: EventStartMusic,
        order: [["uploaded", "desc"]],
        limit: 1
      }
    ]
  });
  if (
    await fs.promises
      .access(targetPath)
      .then(() => true)
      .catch(() => false)
  ) {
    await fs.promises.rmdir(targetPath, { recursive: true });
  }

  let i = 1;
  let failed = [];

  for (const start of starts) {
    console.log(`Copying ${i++} of ${starts.length}`);
    try {
      const exportedFolder = path.join(
        targetPath,
        path.relative(
          config.musicDir,
          path.dirname(start.EventStartMusics[0].filepath)
        )
      );
      const exportedFilename =
        start.orderPosition +
        "#" +
        sanitize(start.actName) +
        "#" +
        path.basename(start.EventStartMusics[0].filepath);
      await fs.promises.mkdir(exportedFolder, { recursive: true });
      await fs.promises.copyFile(
        start.EventStartMusics[0].filepath,
        path.join(exportedFolder, exportedFilename)
      );
    } catch (e) {
      failed.push(start);
      console.trace(e);
      console.error(`Copying of ${start.EventStartMusics[0].filepath} failed`);
    }
  }
  console.log(failed);
}

main();
