/* Handles the backend aspect of the saving system
*  Save/Load events
*/

const GAME_DATA_TYPE = {
    time: "time",
    quest: "quest",
    entities: "entities",
    inventory: "inventory",
    tree: "tree",
    player: "player"
}

class SaveManager
{
    #saveData = {};

    constructor(phaserScene) {
        this.phaserScene = phaserScene;
        if (phaserScene.sharedData.saving === undefined) {
            phaserScene.sharedData.saving = this;
            this.loadGameData();
        }
    }

    saveGameData() {
        this.setGameData(GAME_DATA_TYPE.time, this.phaserScene.sharedData.timeManager.getCurrentTime());
        this.setGameData(GAME_DATA_TYPE.entityTime, this.phaserScene.sharedData.entities.timeTrackedEntities);
        this.setGameData(GAME_DATA_TYPE.entities, this.phaserScene.sharedData.entities.spawnedEntities);
        this.phaserScene.sharedData.quest.manager.saveUserQuestData();

        saveData(DATA_TYPES.game, this.#saveData, GAME_ID.Adventures);
    }

    loadGameData() {
        this.#saveData = loadData(DATA_TYPES.game, GAME_ID.Adventures);

        if (!this.#saveData) {
            this.#saveData = {}
            for (let i = 0; i < Object.keys(GAME_DATA_TYPE).length; i++) {
                this.#saveData[Object.keys(GAME_DATA_TYPE)[i]] = {}
            }
        }
    }

    getGameData(dataType) {
        if (this.#saveData[dataType] === undefined) {
            return undefined;
        }

        return this.#saveData[dataType];
    }

    setGameData(dataType, data) {
        this.#saveData[dataType] = data;
    }
}