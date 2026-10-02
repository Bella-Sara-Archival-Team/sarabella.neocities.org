/* Handles the backend aspect of the quests
*  Save/Load quests, Unlock/Finish, etc.
*/
class QuestManager {
    QUEST_STATES = {
        UNAVAILABLE: -1,
        AVAILABLE: 0,
        FINISHED: 1
    }

    QUEST_TOKENS = {}

    constructor (phaserScene) {
        this.phaserScene = phaserScene
        this.busy = true // Used to prevent trigger checks if the manager is currently checking already

        if (this.phaserScene.sharedData.quest === undefined) {
            this.phaserScene.sharedData.quest = {};
        }
        if (this.phaserScene.sharedData.quest.logic === undefined) {
            this.isInitialised = false
            this.questsToRetryInitializing = {
                activeQuest: [],
                finishedQuest: []
            }
            this.phaserScene.sharedData.quest.logic =  {
                quests: [],
                activeQuests: []
            }
        } else {
            this.isInitialised = true
        }
        if (!this.isLoaded) {
            this.isLoaded = false
            this.preloadQuestData()
            this.isLoaded = true
        }
    }


    //------- HELPER FUNCTIONS -------
    /**
     * Finds all quests with the given status
     * @param {*} status The status to match
     * @returns an array of quest values with the given status
     */
    getAllQuestsByStatus(status) {
        var quests = [];

        this.phaserScene.sharedData.quest.logic.quests.forEach(file => {
            for (let [key] of Object.entries(file)) {
                if (!key.includes("ADS")) {continue}
                adventures = file[key]

                for (let [key] of Object.entries(adventures)) {
                    if (!key.includes("ADV")) {continue}
                    adventure = adventures[key]

                    for (let [key] of Object.entries(adventure)) {
                        if (!key.includes("QUE")) {continue}
                        quest = adventure[key]

                        if (quest.status === status)
                            quests.push(quest);
                    }
                }
            }
        });

        return quests;
    }


    /**
     * Finds all quests with the given status
     * @param {*} status The status to match
     * @returns an array of quest values with the given status
     */
    getAllQuestIDsByStatus(status) {
        var quests = [];

        this.phaserScene.sharedData.quest.logic.quests.forEach(file => {
            for (let [adsKey] of Object.entries(file)) {
                if (!adsKey.includes("ADS")) {continue}
                adventures = file[adsKey]

                for (let [advKey] of Object.entries(adventures)) {
                    if (!advKey.includes("ADV")) {continue}
                    adventure = adventures[advKey]

                    for (let [queKey] of Object.entries(adventure)) {
                        if (!queKey.includes("QUE")) {continue}
                        quest = adventure[queKey]

                        if (quest.status === status)
                            quests.push([adsKey, advKey, queKey]);
                    }
                }
            }
        });

        return quests;
    }

    /**
     * Finds the adventure with the matching ID
     * @param {*} adventureID The ID to search for. Should be an array with at least two values [adventuresID, adventureID]
     * @returns The adventure with the given ID
     */
    getAdventurePerID(adventureID) {
        const quests = this.phaserScene.sharedData.quest.logic.quests
        for (let [i] of Object.entries(quests))
        {
            if (quests[i][adventureID[0]] &&
                quests[i][adventureID[0]][adventureID[1]]
            ) {
                return quests[i][adventureID[0]][adventureID[1]];
            }
        }

        console.error("No Adventure found! " + adventureID[0] + " - " + adventureID[1]);
    }

    /**
     * Finds the quest with the matching ID
     * @param {*} questID The ID to search for. Should be an array with at least three values [adventuresID, adventureID, questID], though the first two values may be null
     * @returns The quest with the given ID
     */
    getQuestPerID(questID) {
        const quests = this.phaserScene.sharedData.quest.logic.quests
        if (!questID[0] || !questID[1]) {questID = this.getFullQuestID(questID)}
        for (let [i] of Object.entries(quests)) {
            if (quests[i][questID[0]] &&
                quests[i][questID[0]][questID[1]] &&
                quests[i][questID[0]][questID[1]][questID[2]]
            ) {
                return quests[i][questID[0]][questID[1]][questID[2]];
            }
        }
        if (this.isInitialised) {
            console.error("No Quest found! " + questID[0] + " - " + questID[1] + " - " + questID[2]);
        }
    }

    /**
     * Takes a partial quest ID and finds the matching adventuresID and adventureID
     * @param {*} questID  The ID to search for. Should be an array with at least three values [adventuresID, adventureID, questID], though the first two values may be null
     * @returns 
     */
    getFullQuestID(questID) {
        if (questID[0] && !questID[1]) {return questID}
        const quests = this.phaserScene.sharedData.quest.logic.quests
        for (let i = 0; i < quests.length; i++) {
            for (let [adsKey] of Object.entries(quests[i])) {
                if (questID[0]) { adsKey = questID[0] }
                if (!adsKey.includes("ADS")) {continue}
                adventures = quests[i][adsKey]

                for (let [advKey] of Object.entries(adventures)) {
                    if (questID[1]) { advKey = questID[1]}
                    if (!advKey.includes("ADV")) {continue}
                    adventure = adventures[advKey]

                    for (let [queKey] of Object.entries(adventure)) {
                        if (!queKey.includes("QUE")) {continue}
                        else if (queKey === questID[2]) {return [adsKey, advKey, queKey]}
                    }
                }
            }
        }

        console.error("No Quest found from partial ID! " + questID[0] + " - " + questID[1] + " - " + questID[2]);
    }

    getQuestStatus(questID) {
        var questData = this.getQuestPerID(questID);
        if (questData !== undefined) return questData.status;
    }

    debug_DrawTriggerQuest(phaserScene) {
        if (phaserScene === undefined) {
            phaserScene = this.phaserScene;
        }

        if (phaserScene.questTriggerDebug === undefined)
            phaserScene.questTriggerDebug = [];
        else {
            for (let i = phaserScene.questTriggerDebug.length - 1; i >= 0; i--) {
                phaserScene.questTriggerDebug[i].destroy();
                phaserScene.questTriggerDebug.pop(i);
            }
        }

        for (let i = 0; i < phaserScene.sharedData.quest.logic.activeQuests.length; i++) {
            let questGlobalData = this.getQuestPerID(phaserScene.sharedData.quest.logic.activeQuests[i]);

            for (let lineIndex = 0; lineIndex < questGlobalData.line.length; lineIndex++) {
                let triggerData = questGlobalData.line[lineIndex].trigger.object[0];

                if (triggerData.zoneId != undefined && 
                    triggerData.zoneId == phaserScene.sharedData.global.currentZone) {
                    for (let x = triggerData.centerX - triggerData.radius; x < triggerData.centerX + triggerData.radius; x++) {
                        for (let y = triggerData.centerY - triggerData.radius; y < triggerData.centerY + triggerData.radius; y++) {
                            if (Math.abs(x - triggerData.centerX) + Math.abs(y - triggerData.centerY) <= triggerData.radius) {
                                let pos = phaserScene.gridToIsoMap(parseInt(x), parseInt(y));
                                var rect = new Phaser.GameObjects.Rectangle(phaserScene, pos.x, pos.y, 25, 12, 0xff0000, 1).setAlpha(.5);
                                phaserScene.add.existing(rect);
                            }
                        }
                    }
                }
            }
        }
    }

    getActiveQuestsWithCharacter(characterID) {
        let available = this.phaserScene.sharedData.quest.logic.activeQuests
        const quests = []
        let counter = 0
        for (let index = 0; index < available.length; index++) {
            const questData = this.getQuestPerID(available[index]);
            for (let lineIndex = 0; lineIndex < questData.line.length; lineIndex++) {
                if (questData.line[lineIndex].trigger.object[0].type === "TalkQuestTrigger"
                     && questData.line[lineIndex].trigger.object[0].identifier === characterID
                ) {
                    quests.push(available[index])
                    counter++
                }
            }
        }
        while (quests.length < counter) {}
        return quests
    }

    //------- QUEST OVERRIDES -------

    #QUEST_OVERRIDES = {
        "0000000825-0000000904-0000002142": [
            ["ADS-0000000932", "ADV-0000001330", "QUE-0000004185"] // Dye tutorial, will trigger on the next game launch
        ]
    }

    /**
     * May be modified in the future. 
     * An easy way for us to start specific quests after others without needing to modify the .xml for the release version
     * This is supposed to help us be able to start code-related or time-related quests based on the last finished quest 
     * @param {*} questID The last finished quest
     */
    #tryManuallyStartingQuests(questID)
    {
        // TODO: probably should separate this in it's own function since we use it at two spot
        // although maybe we can also find a better way to handle how to store the QUEST_OVERRIDES to not need this too...
        function stringifyQuest(quest) {
            const ads = quest[0].replace("ADS-", "")
            const adv = quest[1].replace("ADV", "")
            const que = quest[2].replace("QUE", "")
            return ads+adv+que
        }

        let finishedQuest = stringifyQuest(questID);
        if (!this.#QUEST_OVERRIDES[finishedQuest]) return;

        this.#QUEST_OVERRIDES[finishedQuest].forEach(quest => {
            this.makeQuestAvailable(quest);
        });
    }

    //------- END QUEST OVERRIDES -------

    //------- QUEST LOADING -------
    // TODO : get the quests info from somewhere
    #QUEST_FILE_NAMES = [
        "freeplay_v2",
        "tutorials",
        "collectibles",
        "free_springfestival",
        "intro_cottage",
        "repeatable",
        "springcarnival/sc_1",
        "springcarnival/sc_6",
        "spc1activation",
        "gp1.01",
        "gp1.07",
        "furniturestore"
        //"freeplay" // not sure this one is used since there is a "freeplay_v2.xml" file
    ]

    /**
     * Preloads the xml files for the quests into cache so they can be used later. Should be called from the loadScreen scene
     */
    preloadQuestData() {
        this.#QUEST_FILE_NAMES.forEach(file => {
            this.phaserScene.load.xml(file, `${QUEST_XML_PATH}${file}.xml`);
        });
    }

    /**
     * Loads and parses the xml files from the cache, and then initializes the quests. Should be called from the loadScreen scene
     */
    async initializeQuestData() {
        if (this.isInitialised) {return}
        let questData = this.phaserScene.sharedData.quest.logic.quests
        for (let index = 0; index < this.#QUEST_FILE_NAMES.length; index++) {
            questData.push(parseQuestXML(this, this.phaserScene.cache.xml.get(this.#QUEST_FILE_NAMES[index])))
        }

        await this.#initializeSavedQuests();
        this.#initializeQuestConfig()

        this.saveUserQuestData()
        this.busy = false
    }

    async #initializeSavedQuests(isRetry = false) {
        let savedUserQuestData
        if (isRetry) {
            savedUserQuestData = this.questsToRetryInitializing
        } else {
            savedUserQuestData = this.#parseSavedQuestData()
        }

        // Make quests available based on the user save data
        for (let index = 0; index < savedUserQuestData[0].length; index++) {
            await this.makeQuestAvailable(savedUserQuestData[0][index]);
        }
        for (let index = 0; index < savedUserQuestData[1].length; index++) {
            await this.markQuestFinished(savedUserQuestData[1][index]);
        }

        // Load the tokens back from the user save data
        this.QUEST_TOKENS = savedUserQuestData[2];
    }

    #initializeQuestConfig() {

        let data = this.phaserScene.sharedData.saving.getGameData(GAME_DATA_TYPE.entities);
        if (data) {
            this.phaserScene.sharedData.entities.spawnedEntities = data;
        }

        // Note: check to be sure, but since these are added as spawned entities, they should stick around if they are not removed by later quests.
        // Could swap quest ids and file key around though if not, but we'd need to be sure it's not adding the same entities multiple times if it 
        // was previously saved (based on finished quests?)

        const activeQuests = this.phaserScene.sharedData.quest.logic.activeQuests
        for (let index = 0; index < activeQuests.length; index++) {
            const quest = activeQuests[index];

            for (let index = 0; index < this.#QUEST_FILE_NAMES.length; index++) {
                const fileKey = this.#QUEST_FILE_NAMES[index];
                const questConfig = this.phaserScene.sharedData.quest.config[fileKey]
                if (questConfig !== undefined && questConfig.quests.includes(`${quest[0]}_${quest[1]}_${quest[2]}`)) {
                    for (let [zoneKey] of Object.entries(questConfig)) {
                        if (zoneKey === "quests") continue

                        const zoneData = questConfig[zoneKey]
                        if (this.phaserScene.sharedData.entities.spawnedEntities[zoneKey] === undefined) {
                            this.phaserScene.sharedData.entities.spawnedEntities[zoneKey] = zoneData
                        } else {
                            this.phaserScene.sharedData.entities.spawnedEntities[zoneKey] = {...zoneData, ...this.phaserScene.sharedData.entities.spawnedEntities[zoneKey]}
                        }
                        while (Object.entries(questConfig).length > this.phaserScene.sharedData.entities.spawnedEntities[zoneKey]) {}
                        
                    }
                }
            }
        }
    }

    async initializeNPCQuestData() {
        if (this.isInitialised) {return}
        this.phaserScene.sharedData.quest.logic.quests.npcQuests = {}
        this.phaserScene.sharedData.quest.logic.quests.npcQuests["ADS-NPCs"] = {
            description: {text:"NPC quests"}
        }

        const npcs = this.phaserScene.sharedData.template.data.npcData.things[0]
        this.phaserScene.sharedData.quest.logic.npcQuests = []
        for (let [npcKey] of Object.entries(npcs)) {
            const npc = npcs[npcKey][0]
            if (npc.Logic) {
                const advKey = "ADV-"+npcKey
                this.phaserScene.sharedData.quest.logic.quests.npcQuests["ADS-NPCs"][advKey] ={
                    description: {text: "NPC quests"}
                }
                for (let [key] of Object.entries(npc.Logic[0])) {
                    if (key.startsWith("QUE")) {
                        this.phaserScene.sharedData.quest.logic.quests.npcQuests["ADS-NPCs"][advKey][key] = npc.Logic[0][key]
                        this.phaserScene.sharedData.quest.logic.quests.npcQuests["ADS-NPCs"][advKey][key].status = this.phaserScene.sharedData.quest.manager.QUEST_STATES.AVAILABLE
                        this.phaserScene.sharedData.quest.logic.quests.npcQuests["ADS-NPCs"][advKey][key].visible = "False"
                        this.phaserScene.sharedData.quest.logic.quests.npcQuests["ADS-NPCs"][advKey][key].targetZone = "Z-1"
                        await this.phaserScene.sharedData.quest.manager.makeQuestAvailable(["ADS-NPCs", advKey, key])
                    }
                }
            }
        }
        this.setNPCQuestLocations()
        // TODO: add system to add/finish quests that were loaded in by the NPC templates
        console.log("Still need to retry adding these!", this.questsToRetryInitializing)
        this.isInitialised = true
    }

    setNPCQuestLocations() {
        const entityZones = this.phaserScene.sharedData.template.manager.getEntityZones()
        const activeQuests = this.phaserScene.sharedData.quest.logic.activeQuests

        for (let [entityKey] of Object.entries(entityZones)) {
            for (let index = 0; index < activeQuests.length; index++) {
                const questID = activeQuests[index];
                // console.log(questID[1], entityKey)
                if (questID[1].replace("ADV-", "").startsWith(entityKey)) {
                    const questData = this.getQuestPerID(questID)
                    if (entityZones[entityKey].includes(this.phaserScene.sharedData.global.currentZone)) {
                        questData.targetZone = this.phaserScene.sharedData.global.currentZone
                    } else {
                        questData.targetZone = entityZones[entityKey][0]
                    }
                }
            }
        }
    }

    /**
     * Parses the saved quest data for the user
     * @returns an array with the active quest save data, the finished quest save data and the quest tokens
     */
    #parseSavedQuestData() {
        function unstringifyQuest(savedData) {
            savedData = savedData.split("_")
            // Currently ignoring version since there's only one so far
            for (let index = 1; index < savedData.length; index++) {
                let quest = savedData[index].replace("Q", "").split("-")
                quest[0] = "ADS-" + quest[0]
                quest[1] = "ADV-" + quest[1]
                quest[2] = "QUE-" + quest[2]
                savedData[index] = quest
            }
            savedData.splice(0, 1)
            return savedData
        }

        let data = this.phaserScene.sharedData.saving.getGameData(GAME_DATA_TYPE.quest);
        let activeSavedData;
        let finishedSavedData;
        let activeSavedString;
        let finisedSavedString;
        let tokensData;

        if (!data || !data.activeQuest) {
            activeSavedString = 
                "v1"
                + "_Q0000000825-0000000899-0000002110" // Intro tuto
                + "_Q0000000825-0000000899-0000002105" // Talk to Wings
                // + "_Q0000000825-0000000903-0000002130" //  (DEBUG ONLY) Fix bridge
                // + "_Q0000000825-0000000903-0000002132" //  (DEBUG ONLY) Fixed bridge
                + "_Q0000001163-0000001798-0000006239"// Intro Cottage
                // + "_Q0000001051-0000001468-0000004839"  // Free spring carnival (app start trigger)
                // + "_Q0000001173-0000001823-0000006281"  // Furniture store (zone trigger)
        }
        else {
            activeSavedString = data.activeQuest;
        }

        if (!data || !data.finishedQuest) {
            finisedSavedString = "v1"
        }
        else {
            finisedSavedString = data.finishedQuest;
        }

        if (!data || !data.tokens){
            tokensData = {
                "v": "1"
            }
        }
        else {
            tokensData = data.tokens;
        }

        activeSavedData = unstringifyQuest(activeSavedString)
        finishedSavedData = unstringifyQuest(finisedSavedString)
        return [activeSavedData, finishedSavedData, tokensData]
    }

    /**
     * Saves the player's current quest data
     */
    saveUserQuestData() {
        const version = "v1"
        function stringifyQuest(quest) {
            const ads = quest[0].replace("ADS-", "")
            const adv = quest[1].replace("ADV", "")
            const que = quest[2].replace("QUE", "")
            return "_Q" + ads+adv+que
        }

        let saveString = version
        this.phaserScene.sharedData.quest.logic.activeQuests.forEach(activeQuest => {
            saveString = saveString + stringifyQuest(activeQuest)
        });

        let finishedString = version
        let finishedQuests = this.getAllQuestIDsByStatus(this.QUEST_STATES.FINISHED)
        finishedQuests.forEach(finishedQuest => {
            finishedString = finishedString + stringifyQuest(finishedQuest)
        });

        let questData = {
            activeQuest: saveString,
            finishedQuest: finishedString,
            tokens: this.QUEST_TOKENS
        }

        this.phaserScene.sharedData.saving.setGameData(GAME_DATA_TYPE.quest, questData);
    }

    /**
     * Makes the specified quest available. Is async to more easily ensure the quest is added before continuing
     * @param {*} questID The ID array for the quest to be added
     */
    async makeQuestAvailable(questID) {
        if (!questID[0] || !questID[1]) {questID = this.getFullQuestID(questID)}
        var questData = this.getQuestPerID(questID);
        if (!this.isInitialised && questData === undefined) {
            this.questsToRetryInitializing.activeQuest.push(questID)
        }
        if (questData === undefined) {
            return
        }
        questData.status = this.QUEST_STATES.AVAILABLE;
        console.log("Quest made available: " + questID[0] + " - " + questID[1] + " - " + questID[2] + " - " + questData.description.text);

        let questIndex = -1
        for (let i = 0; i < this.phaserScene.sharedData.quest.logic.activeQuests.length; i++) {
            if (questID[2] === this.phaserScene.sharedData.quest.logic.activeQuests[i][2]
                && questID[1] === this.phaserScene.sharedData.quest.logic.activeQuests[i][1]
            ) { 
                questIndex = i 
                break;
            }
        }
        if (questIndex === -1) {
            this.phaserScene.sharedData.quest.logic.activeQuests.push(questID)
        }

        // TODO: Handle showing icons on map and handling correct triggers

        let awaitingQuestActivation = true
        while (awaitingQuestActivation) {
            for (let i = 0; i < this.phaserScene.sharedData.quest.logic.activeQuests.length; i++) {
                if (questID[2] === this.phaserScene.sharedData.quest.logic.activeQuests[i][2]) { awaitingQuestActivation = false }
                break;
            }
            return
        }
    }

    /**
     * Makes the specified quest finished. Is async to more easily ensure the quest is removed before continuing
     * @param {*} questID The ID array for the quest to be removed
     */
    async markQuestFinished(questID) {
        if (!questID[0] || !questID[1]) {questID = this.getFullQuestID(questID)}
        let questData = this.getQuestPerID(questID);
        if (!this.isInitialised && questData === undefined) {
            this.questsToRetryInitializing.finishedQuest.push(questID)
        }
        if (questData === undefined || questData.status === this.QUEST_STATES.FINISHED) {
            return
        }
        questData.status = this.QUEST_STATES.FINISHED;


        let questIndex = -1
        for (let i = 0; i < this.phaserScene.sharedData.quest.logic.activeQuests.length; i++) {
            if (questID[2] === this.phaserScene.sharedData.quest.logic.activeQuests[i][2]) { 
                questIndex = i 
                break;
            }
        }
        
        if (questIndex >=0) {
            this.phaserScene.sharedData.quest.logic.activeQuests.splice(questIndex, 1);
        }

        this.#tryManuallyStartingQuests(questID);

        return
    }

    //------- QUEST TRIGGERS -------
    /**
     * Checks if any active quests should be triggered.
     * @param {*} phaserScene 
     * @param {*} triggerData The data to send to the trigger function
     * @returns 
     */
    tryTriggerQuest(phaserScene, triggerData) {
        // TODO Add variable to pass in a known known trigger type (e.g. try trigger after dialogue click, so only check dialogue trigger)
        if (!this.busy) {
            this.busy = true
            for (let activeQuestIndex = 0; activeQuestIndex < phaserScene.sharedData.quest.logic.activeQuests.length; activeQuestIndex++) {
                let questGlobalData = this.getQuestPerID(phaserScene.sharedData.quest.logic.activeQuests[activeQuestIndex]);

                if (questGlobalData.targetZone && questGlobalData.targetZone !== phaserScene.sharedData.global.currentZone) continue
                if ((triggerData.templateID && questGlobalData.targetTemplate && questGlobalData.targetTemplate !== triggerData.templateID)
                    && (triggerData.targetTemplate && questGlobalData.targetTemplate && questGlobalData.targetTemplate !== triggerData.targetTemplate)
                ) continue

                for (let lineIndex = 0; lineIndex < questGlobalData.line.length; lineIndex++) {
                    const triggers = questGlobalData.line[lineIndex].trigger.object

                    if (questGlobalData.wasTriggered || !this.checkConditions(phaserScene, questGlobalData, lineIndex, triggerData)) continue

                    for (let index = 0; index < triggers.length; index++) {
                        const trigger = triggers[index];
                        if (trigger.type === triggerData.type && this.#QUEST_TRIGGERS[trigger.type]) {
                            if (this.#QUEST_TRIGGERS[trigger.type](phaserScene, trigger, activeQuestIndex, lineIndex, triggerData)) {
                                questGlobalData.wasTriggered = true
                                this.busy = false
                                return true
                            }
                        }
                    }
                }
            }
            this.busy = false
        } else {
            if (!this.isLoaded) {
                console.error("Skipped. Trigger attempted before quest manager was loaded", triggerData)
            } else if (!this.isInitialised) {
                console.error("Skipped. Trigger attempted before quest manager was initialised", triggerData)
            } else {
                console.warn("Skipped. We might need to add a queue if this starts happening", triggerData)
            }
        }
        return false;
    }

    // Note: this is both checked and set off multiple times due to loading times between scenes not always being consistent, 
    // so we may find that what we need to check or where we need to set it off changes over time
    tryZoneStartTriggers() {
        if (this.lastZoneTrigger !== this.phaserScene.zoneConfig.ID 
            && this.isInitialised 
            && this.phaserScene.sharedData.ui.isInitialized 
            && this.phaserScene.sharedData.keyboard !== undefined
        ) {
            this.lastZoneTrigger = this.phaserScene.zoneConfig.ID

            let triggerInfo = {
                type: "EnterZoneTrigger"
            }
            this.tryTriggerQuest(this.phaserScene, triggerInfo);


            if (!this.phaserScene.sharedData.global.appStarted) {
                this.phaserScene.sharedData.global.appStarted = true
                triggerInfo = {
                    type: "ApplicationStartTrigger"
                }
                this.tryTriggerQuest(this.phaserScene, triggerInfo);
            }
        }
    }

    #QUEST_TRIGGERS = {
        "TalkQuestTrigger": this.#talkQuestTrigger,
        "EnterZoneTrigger": this.#enterZoneTrigger,
        "StopNearTrigger": this.#stopNearTrigger,
        "RemoveEntityTrigger": this.#removeEntityTrigger,
        "ActionTrigger": this.#actionTrigger,
        "ContextItemTrigger": this.#contextItemTrigger,
        "GiveItemTrigger": this.#giveItemTrigger,
        "ApplyItemTrigger": this.#giveItemTrigger, // TODO double check this works
        "DialogueChoiceTrigger": this.#dialogueChoiceTrigger,
        "PlantGrownInRadiusTrigger": this.#plantGrownInRadius,
        "TradeTrigger": this.#missingTrigger,
        "ApplicationStartTrigger": this.#applicationStartTrigger,
        "NullTrigger": this.#nullTrigger
    }

    #missingTrigger (phaserScene, trigger, activeQuestIndex, lineIndex, triggerData) {
        console.warn(`Missing trigger: ${trigger.type}`)
        return false
    }

    #applicationStartTrigger(phaserScene, trigger, activeQuestIndex, lineIndex, triggerData) {
        let questGlobalID = phaserScene.sharedData.quest.logic.activeQuests[activeQuestIndex];
        phaserScene.sharedData.quest.manager.doQuestAction(questGlobalID, lineIndex);
        return true;
    }

    #stopNearTrigger(phaserScene, trigger, activeQuestIndex, lineIndex, triggerData) {
        let questGlobalID = phaserScene.sharedData.quest.logic.activeQuests[activeQuestIndex];
        const centerX = parseInt(trigger.centerX)
        const centerY = parseInt(trigger.centerY)
        const radius = parseInt(trigger.radius)

        if (trigger 
            && trigger.zoneId
            && trigger.zoneId === phaserScene.zoneConfig.ID
            && triggerData.x !== undefined
            && triggerData.y !== undefined
        ) {
            // for (let x = centerX - radius; x < centerX + radius; x++) {
            //     for (let y = centerY - radius; y < centerY + radius; y++) {
            //         if (Math.abs(x - centerX) + Math.abs(y - centerY) <= radius) {
            //             let pos = phaserScene.gridToIsoMap(parseInt(x), parseInt(y));
            //             var rect = new Phaser.GameObjects.Rectangle(phaserScene, pos.x, pos.y, 25, 12, 0xff0000, 1).setAlpha(.5);
            //             phaserScene.add.existing(rect);
            //         }
            //     }
            // }
            if (Math.abs(triggerData.x - centerX) + Math.abs(triggerData.y - centerY) <= radius) {
                phaserScene.sharedData.quest.manager.doQuestAction(questGlobalID, lineIndex);
                return true;
            }
        } 
        return false
    }

    #talkQuestTrigger(phaserScene, trigger, activeQuestIndex, lineIndex, triggerData) {
        let questGlobalID = phaserScene.sharedData.quest.logic.activeQuests[activeQuestIndex];
        const entity = triggerData.entityID;
        if (entity === trigger.identifier
            && triggerData.questID === phaserScene.sharedData.quest.logic.activeQuests[activeQuestIndex][2]
        ) {
            phaserScene.sharedData.quest.manager.doQuestAction(questGlobalID, lineIndex);
            return true
        }
        return false
    }

    #enterZoneTrigger(phaserScene, trigger, activeQuestIndex, lineIndex, triggerData) {
        let questGlobalID = phaserScene.sharedData.quest.logic.activeQuests[activeQuestIndex];

        if (trigger 
            && trigger.zoneName !== undefined
            && trigger.zoneName[0] === phaserScene.zoneConfig.ID
        ) {
            phaserScene.sharedData.quest.manager.doQuestAction(questGlobalID, lineIndex);
            return true;
        } 
        return false
    }

    #removeEntityTrigger(phaserScene, trigger, activeQuestIndex, lineIndex, triggerData) {
        let questGlobalID = phaserScene.sharedData.quest.logic.activeQuests[activeQuestIndex];
        const entity = triggerData.templateID;
        for (let index = 0; index < trigger.template.length; index++) {
            const template = trigger.template[index];
            if (entity === template) {
                phaserScene.sharedData.quest.manager.doQuestAction(questGlobalID, lineIndex);
                return true
            }
        }
        return false
    }

    #actionTrigger(phaserScene, trigger, activeQuestIndex, lineIndex, triggerData) {
        if (trigger.className[0].replace("actions::", "") !== triggerData.actionClass) return false

        let questGlobalID = phaserScene.sharedData.quest.logic.activeQuests[activeQuestIndex];
        phaserScene.sharedData.quest.manager.doQuestAction(questGlobalID, lineIndex);

        return true
    }

    #contextItemTrigger(phaserScene, trigger, activeQuestIndex, lineIndex, triggerData) {
        if (trigger.contextItem[0] !== triggerData.actionClass
            || trigger.template[0] !== triggerData.template
        ) return false

        let questGlobalID = phaserScene.sharedData.quest.logic.activeQuests[activeQuestIndex];
        phaserScene.sharedData.quest.manager.doQuestAction(questGlobalID, lineIndex);

        return true
    }

    #giveItemTrigger(phaserScene, trigger, activeQuestIndex, lineIndex, triggerData) {
        if (trigger.inventoryTemplate[0] !== triggerData.inventoryTemplate
            || trigger.targetTemplate[0] !== triggerData.templateID
        ) return false

        let questGlobalID = phaserScene.sharedData.quest.logic.activeQuests[activeQuestIndex];
        phaserScene.sharedData.quest.manager.doQuestAction(questGlobalID, lineIndex);

        return true
    }

    #dialogueChoiceTrigger(phaserScene, trigger, activeQuestIndex, lineIndex, triggerData) {
        if (trigger.identifier === triggerData.line) {
            let questGlobalID = phaserScene.sharedData.quest.logic.activeQuests[activeQuestIndex];
            phaserScene.sharedData.quest.manager.doQuestAction(questGlobalID, lineIndex);
            return true
        }
        return false
    }

    #plantGrownInRadius(phaserScene, trigger, activeQuestIndex, lineIndex, triggerData) {
        let questGlobalID = phaserScene.sharedData.quest.logic.activeQuests[activeQuestIndex];
        const centerX = parseInt(trigger.centerX)
        const centerY = parseInt(trigger.centerY)
        const radius = parseInt(trigger.radius)

        if (trigger 
            && trigger.zoneId
            && trigger.zoneId === phaserScene.zoneConfig.ID
            && triggerData.x !== undefined
            && triggerData.y !== undefined
        ) {
            if (Math.abs(triggerData.x - centerX) + Math.abs(triggerData.y - centerY) <= radius) {
                phaserScene.sharedData.quest.manager.doQuestAction(questGlobalID, lineIndex);
                return true;
            }
        } 
        return false
    }

    #nullTrigger (phaserScene, trigger, activeQuestIndex, lineIndex, triggerData) {
        return false
    }


    //------- QUEST CONDITIONS -------
    checkConditions (phaserScene, questData, lineIndex, trigger) {
        const questLine = questData.line[lineIndex]

        if (questLine.conditions === undefined
            || questLine.conditions.object === undefined
            || questLine.conditions.object[0] === undefined
            || questLine.conditions.object[0].type === undefined
        ) {return true}

        var conditionsMet = true;
        for (let i = 0; i < questLine.conditions.object.length; i++)
        {
            if (!this.#QUEST_CONDITIONS[questLine.conditions.object[i].type](phaserScene, questData, lineIndex, trigger, i))
            {
                conditionsMet = false;
                break;
            }
        }
        return conditionsMet;
    }

    #QUEST_CONDITIONS = {
        "ActionOnTemplateCondition": this.#actionOnTemplate,
        "HasMultipleItemsCondition": this.#hasMultipleItemsCondition,
        "ContainsTokenItemCondition": this.#containsTokenItemCondition,
        "HasQuestCondition": this.#hasQuestCondition,
        "TokenGreaterThanOrEqualCondition": this.#tokenGreaterThanOrEqualCondition, // TODO: to test
        "CharacterNearCondition": this.#characterNearCondition // TODO: to test
    }

    #missingCondition (phaserScene, questData, lineIndex, trigger, index) {
        const questLine = questData.line[lineIndex]
        console.warn(`Missing condition: ${questLine.conditions.object[index].type}`)
    }

    #actionOnTemplate(phaserScene, questData, lineIndex, trigger, index) {
        const questLine = questData.line[lineIndex]
        return questLine.conditions.object[index].template[0] === trigger.template
    }

    #hasMultipleItemsCondition(phaserScene, questData, lineIndex, trigger, index) {
        const questLine = questData.line[lineIndex]
        const condition = questLine.conditions.object[index]
        
        return phaserScene.sharedData.inventory.allItems[condition.template[0]] >= parseInt(condition.count[0])
    }

    #containsTokenItemCondition(phaserScene, questData, lineIndex, trigger, index){
        let tokens = phaserScene.sharedData.quest.manager.QUEST_TOKENS;
        const condition = questData.line[lineIndex].conditions.object[index]
        if (!tokens[condition.key]){return false;}
        return tokens[condition.key].includes(condition.item[0]);
    }

    #hasQuestCondition(phaserScene, questData, lineIndex, trigger, index){
        let finishedQuest = trigger.questId[0];
        let quest = this.getQuestPerID([null, null, questData]);
        if (!quest) {return false};
        return quest.status == this.QUEST_STATES.FINISHED;
    }

    #tokenGreaterThanOrEqualCondition(phaserScene, questData, lineIndex, trigger, index){
        let tokens = phaserScene.sharedData.quest.manager.QUEST_TOKENS;
        const condition = questData.line[lineIndex].conditions.object[index]
        if (!tokens[condition.key]){return false;}

        // We force the non-item tokens at 0 to easily get/set them
        if (typeof tokens[condition.key][0] === number)
        {
            let value = parseInt(tokens[condition.key][0]);
            return value >= condition.valueText;
        }
        return false;
    }

    #characterNearCondition(phaserScene, questData, lineIndex, trigger, index){
        return this.#stopNearTrigger(phaserScene, questData, lineIndex, trigger);
    }

    //------- QUEST ACTIONS -------
    async doQuestAction(questGlobalID, lineIndex, actionIndex = 0) {
        let questData = this.getQuestPerID(questGlobalID);
        // if (questData.status == this.QUEST_STATES.UNAVAILABLE ||
        //     questData.status == this.QUEST_STATES.CANCELLED ||
        //     questData.status == this.QUEST_STATES.FINISHED ||
        //     questData.line[lineIndex] === undefined)
        //     return;

        let actionData = questData.line[lineIndex].actions;

        for (let index = actionIndex; index < actionData.object.length; index++) {
            const action = actionData.object[index];

            if (this.#QUEST_ACTIONS[action.type]) {
                questData.currentLine= lineIndex
                questData.currentAction= index+1
                if ((this.#ACTIONS_TO_PAUSE.indexOf(action.type) > -1) &&
                    index+1 < actionData.object.length)
                {
                    this.#QUEST_ACTIONS[action.type](this.phaserScene, questGlobalID, lineIndex, action)
                    return
                } else {
                    await this.#QUEST_ACTIONS[action.type](this.phaserScene, questGlobalID, lineIndex, action)
                }
            }
        }
        questData.wasTriggered = false
    }
    #QUEST_ACTIONS = {
        "LogAdventureBeginAction": this.#logAdventureBeginAction,
        "LogAdventureEndAction": this.#logAdventureEndAction,
        "LogQuestEndAction": this.#logQuestEndAction,
        "AddQuestAction": this.#addQuestAction,
        "RemoveQuestAction": this.#removeQuestAction,
        "AddQuestFileAction": this.#addQuestFileAction,
        "RemoveQuestFileAction": this.#removeQuestFileAction,
        "ShowAdventureCompleteAction": this.#showAdventureCompleteAction,
        "DialogueAction": this.#dialogueAction,
        "DialogueImageAction": this.#dialogueImageAction,
        "DialogueChoiceAction": this.#dialogueChoiceAction,
        "MonologueAction": this.#monologueAction,
        "AddZoneItemAnywhereAction": this.#addZoneItemAnywhereAction,
        "RemoveZoneItemAnywhereAction": this.#removeZoneItemAnywhereAction,
        "TryAddZoneItemToAction": this.#tryAddZoneItemToAction,
        "AddHorseshoesAction": this.#addHorseshoesAction,
        "AddMultipleInventoryAction": this.#addMultipleInventoryAction,
        "RemoveMultipleInventoryAction": this.#removeMultipleInventoryAction,
        "AddTokenItemAction": this.#addTokenItemAction,
        "IncrementTokenAction": this.#incrementTokenAction, // TODO: to test
        "RemoveTokenAction": this.#removeTokenAction,
        "TemporaryAnimationAction": this.#missingAction,
        "PlayMovieClipAction": this.#playMovieClipAction,
        "PlayHeadsUpDisplayMovieClipAction": this.#playMovieClipAction, // TODO: Confirm it works correctly
        "NullAction": this.#nullAction
    }
    #ACTIONS_TO_PAUSE = [
        "ShowAdventureCompleteAction",
        "DialogueAction",
        "DialogueImageAction",
        "DialogueChoiceAction",
        "MonologueAction"
    ]

    async #missingAction (phaserScene, questID, lineIndex, action) {
        console.warn(`Missing action: ${action.type}`)
    }

    async #addQuestFileAction(phaserScene, questID, lineIndex, action){
        console.warn(`Fake adding file: ${action.type} - ${action.fileName} - ${questID}`);
    }

    async #removeQuestFileAction(phaserScene, questID, lineIndex, action){
        console.warn(`Fake removing file: ${action.type} - ${action.fileName} - ${questID}`);
    }

    async #addTokenItemAction(phaserScene, questID, lineIndex, action) {
        console.log(`Adding token: ${action.item} - ${questID}`);
        let tokens = phaserScene.sharedData.quest.manager.QUEST_TOKENS;
        if (!tokens[action.key]){
            tokens[action.key] = [];
        }
        tokens[action.key].push(action.item[0]);
    }

    async #incrementTokenAction(phaserScene, questID, lineIndex, action){
        if (!tokens[action.key]){
            tokens[action.key] = [];
        }

        if (typeof tokens[action.key][0] != "number")
        {
            tokens[action.key].unshift(0);
        }

        tokens[action.key][0] += 1;
        console.log(`Incrementing token: ${questID} - ${tokens[action.key][0]}`);
    }

    async #removeTokenAction(phaserScene, questID, lineIndex, action){
        console.log(`Removing token: ${questID}`);
        let tokens = phaserScene.sharedData.quest.manager.QUEST_TOKENS;
        if (!tokens[action.key]){return;}
        delete[action.key];
    }

    async #logAdventureBeginAction(phaserScene, questID, lineIndex, action) {
        console.log(`Starting adventure ${questID[0]} - ${questID[1]}`)
    }

    async #logQuestEndAction(phaserScene, questID, lineIndex, action) {
        if (!questID[0] || !questID[1]) {questID = phaserScene.sharedData.quest.manager.getFullQuestID(questID)}
        let questData = phaserScene.sharedData.quest.manager.getQuestPerID(questID);
        console.log("End quest: " + questID[0] + " - " + questID[1] + " - " + questID[2] + " - " + questData.description.text);
    }

    async #logAdventureEndAction(phaserScene, questID, lineIndex, action) {
        let adventure = phaserScene.sharedData.quest.manager.getAdventurePerID(questID)
        console.log(`Ending adventure ${questID[0]} - ${questID[1]}`)
        for (let [key] of Object.entries(adventure)) {
            if (!key.includes("QUE")) {continue}
            await phaserScene.sharedData.quest.manager.markQuestFinished([questID[0], questID[1], key])
        }
    }

    async #addQuestAction(phaserScene, questID, lineIndex, action) {
        await phaserScene.sharedData.quest.manager.makeQuestAvailable([null, null, action.questId])
    }

    async #removeQuestAction(phaserScene, questID, lineIndex, action) {
        await phaserScene.sharedData.quest.manager.markQuestFinished(questID)
    }

    async #showAdventureCompleteAction(phaserScene, questID, lineIndex, action) {
        phaserScene.sharedData.success.ui.manager.show(questID);
    }

    async #dialogueAction(phaserScene, questID, lineIndex, action) {
        let questData = phaserScene.sharedData.quest.manager.getQuestPerID(questID);

        let character = undefined
        if (action.identifier) {character = action.identifier}
        if (character === undefined) {
            character = phaserScene.sharedData.quest.manager.getDialogueCharacter(questData, lineIndex)
        }
        if (character === undefined) {
            for (let index = 0; index < questData.line.length; index++) {
                if (index === lineIndex) continue
                const check = phaserScene.sharedData.quest.manager.getDialogueCharacter(questData, index)
                if (check !== undefined) {
                    character = check
                    break
                }
            }
        }

        phaserScene.sharedData.dialogue.ui.manager.show(questID, character, action.text, undefined);
    }

    async #monologueAction(phaserScene, questID, lineIndex, action) {
        phaserScene.sharedData.dialogue.ui.manager.show(questID, undefined, action.text, undefined);
    }

    async #dialogueImageAction(phaserScene, questID, lineIndex, action) {
        let questData = phaserScene.sharedData.quest.manager.getQuestPerID(questID);
        let triggers = questData.line[lineIndex].trigger.object

        
        let character = undefined
        if (action.identifier) {character = action.identifier}
        if (character === undefined) {
            character = phaserScene.sharedData.quest.manager.getDialogueCharacter(questData, lineIndex)
        }
        if (character === undefined) {
            for (let index = 0; index < questData.line.length; index++) {
                if (index === lineIndex) continue
                const check = phaserScene.sharedData.quest.manager.getDialogueCharacter(questData, index)
                if (check !== undefined) {
                    character = check
                    break
                }
            }
        }

        let img = undefined;
        if (action.imageFileName) { 
            img = action.imageFileName[0]
            img = img.split("/")
            img = img[img.length - 1].replace(".png", "")
        }
        
        phaserScene.sharedData.dialogue.ui.manager.show(questID, character, action.text, undefined, img);
    }

    async #dialogueChoiceAction(phaserScene, questID, lineIndex, action) {
        let questData = phaserScene.sharedData.quest.manager.getQuestPerID(questID);

        let character = undefined
        if (action.identifier) {character = action.identifier}
        if (character === undefined) {
            character = phaserScene.sharedData.quest.manager.getDialogueCharacter(questData, lineIndex)
        }
        if (character === undefined) {
            for (let index = 0; index < questData.line.length; index++) {
                if (index === lineIndex) continue
                const check = phaserScene.sharedData.quest.manager.getDialogueCharacter(questData, index)
                if (check !== undefined) {
                    character = check
                    break
                }
            }
        }

        phaserScene.sharedData.dialogue.ui.manager.show(questID, character, action.text, action.choice);
    }
    getDialogueCharacter(questData, lineIndex) {
        let character
        let triggers = questData.line[lineIndex].trigger.object
        for (let index = 0; index < triggers.length; index++) {
            const trigger = triggers[index];
            if (trigger.type === "TalkQuestTrigger" && trigger.identifier) {
                character = trigger.identifier
            }
        }
        if (character === undefined) {
            let actions = questData.line[lineIndex].actions.object
            for (let index = 0; index < actions.length; index++) {
                const action = actions[index];
                if (action.type === "DialogueAction" 
                    && action.identifier) {
                    character = action.identifier
                }
            }
        }
        return character
    }

    async #addZoneItemAnywhereAction (phaserScene, questID, lineIndex, action) {
        if (action.zone[0] === phaserScene.sharedData.global.currentZone) {
            phaserScene.spawnEntity(action.template[0], action.x[0], action.y[0], true, action.zone[0], action.instanceIdentifier[0])
        } else {
            phaserScene.spawnEntity(action.template[0], action.x[0], action.y[0], false, action.zone[0], action.instanceIdentifier[0])
        }
    }

    async #removeZoneItemAnywhereAction (phaserScene, questID, lineIndex, action) {
        let entitiesList = phaserScene.sharedData.entities.spawnedEntities[action.zone[0]]

        for (let [key] of Object.entries(entitiesList)) {
            const entity = entitiesList[key];
            if (action.instanceIdentifier !== undefined 
                && action.instanceIdentifier[0] !== undefined 
                && action.instanceIdentifier[0] === entity.instID
            ) {
                if (action.zone[0] === phaserScene.sharedData.global.currentZone ){
                    phaserScene.entities[key].destroy()
                } else {
                    delete entitiesList[key]
                }
            } else if (action.instanceIdentifier === undefined 
                && action.template[0] === entity.template
            ) {
                if (action.zone[0] === phaserScene.sharedData.global.currentZone ){
                    phaserScene.entities[key].destroy()
                } else {
                    delete entitiesList[key]
                }
            }
        }
    }

    async #tryAddZoneItemToAction (phaserScene, questID, lineIndex, action) {
        if (action.zone[0] === phaserScene.sharedData.global.currentZone) {
            phaserScene.spawnEntity(action.template[0], action.x[0], action.y[0], true, action.zone[0], action.instanceIdentifier[0])
        } else {
            phaserScene.spawnEntity(action.template[0], action.x[0], action.y[0], false, action.zone[0], action.instanceIdentifier[0])
        }
    }

    async #addHorseshoesAction (phaserScene, questID, lineIndex, action) {
        phaserScene.sharedData.inventoryAnimation.ui.manager.show("horseshoe", parseInt(action.count[0]), true)
        addHorseshoes(parseInt(action.count[0]))
    }

    async #addMultipleInventoryAction (phaserScene, questID, lineIndex, action) {
        phaserScene.sharedData.inventory.manager.addItem(action.itemId[0], parseInt(action.count[0]))
        phaserScene.sharedData.inventoryAnimation.ui.manager.show(action.itemId[0], parseInt(action.count[0]), true)
    }

    async #removeMultipleInventoryAction (phaserScene, questID, lineIndex, action) {
        if (action.itemId) {
            phaserScene.sharedData.inventory.manager.removeItem(action.itemId[0], parseInt(action.count[0]))
        } else if (action.template) {
            phaserScene.sharedData.inventory.manager.removeItem(action.template[0], parseInt(action.count[0]))
        }
    }

    async #playMovieClipAction (phaserScene, questID, lineIndex, action) {
        let filePath = action.fileName[0];
        let fileName = filePath.split("/");
        fileName = fileName[fileName.length - 1];
        filePath = `${CUTSCENE_ASSETS_PATH}${fileName}`;

        onFlashStarted(filePath);
    }

    async #nullAction (phaserScene, questID, lineIndex, action) {
    }
}