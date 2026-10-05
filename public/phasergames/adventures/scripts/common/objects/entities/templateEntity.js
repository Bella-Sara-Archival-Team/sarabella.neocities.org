/**
 * This class is meant to handle all entities that use a template for their configuration.
 * The templates included should be
 */
class TemplateEntity extends Entity {

    ITEM_REQUEST_TYPES = {
        "none": 0,
        "give": 1,
        "apply": 2
    }

    constructor(zoneScene, templateID, startX, startY, facingDirection = undefined, addToCurrentZone = true, loadLate = false, additionalConfig) {
        super(zoneScene, templateID, startX, startY, facingDirection);
        this.templateID = templateID
        this.zoneID = zoneScene.zoneConfig.ID
        this.variant = this.getTemplateValue(["MovieClip", "className", "text"], this.templateID);

        if (additionalConfig) {
            if (additionalConfig.isWatered) {
                this.isWatered = additionalConfig.isWatered
            }
            if (additionalConfig.hasGivenMagic) {
                this.hasGivenMagic = additionalConfig.hasGivenMagic
            }
            if (additionalConfig.isWilted) {
                this.isWilted = additionalConfig.isWilted
            }
            if (additionalConfig.variant) {
                this.variant = additionalConfig.variant
            }
            if (additionalConfig.facingDirection) {
                this.facingDirection = additionalConfig.facingDirection
            }
        }


        if (addToCurrentZone && loadLate) {
            zoneScene.load.once('complete', this.create, this);
            this.load();
            zoneScene.load.start();
        } else if (addToCurrentZone) {
            this.load();
        }
    }


    // ------- INITIALIZE ENTITY -------
    /**
     * Loads assets for the entity sprite. Should run in the constructor (during the preload phase of zone scene setup)
     */
    load() {
        // Set asset path
        this.assetPath = `${this.assetPath}/Entities`

        let charName = this.getTemplateValue(["Character", "identifier", "text"])
        if (charName) {
            this.entityID = charName
        }
        let facing = parseInt(this.getTemplateValue(["Isometric", "scaleX", "text"]))
        
        if (facing && (this.facingDirection === undefined || this.facingDirection === "default")) {
            this.facingDirection = facing === -1 ? this.FACING_DIRECTIONS.Southwest : this.FACING_DIRECTIONS.Southeast;
        } else if (this.facingDirection === undefined) {
            this.facingDirection = this.FACING_DIRECTIONS.Southeast
        }
        
        this.spriteType = this.#loadSpriteData()
        this.#loadSpawnerData()
    }

    /**
     * Instantiates the entity sprite. Should run during the create phase of zone scene setup
     */
    create() {
        this.#setGridTileData()
        this.#createPlantData()
        this.#createSprite()
        this.updateSpriteVariant(this.variant);
        if (this.isSpawner) {this.#trySpawn() }
    }

    update() {
        if (this.isSpawner) { this.#trySpawn() }
        if (this.isPlant) { this.#tryGrow()}
    }
    // ------- END INITIALIZE ENTITY -------


    // ------- LOAD FUNCTIONS -------
    #loadSpriteData(templateID = this.templateID) {
        let spriteClass = this.getTemplateValue(["MovieClip", "className", "text"], templateID)
        let spriteType = this.SPRITE_TYPES.noSprite

        if (spriteClass !== undefined && spriteClass !== "T0179") {
            let folderName = this.getTemplateValue(["MovieClip", "fileName", "text"], templateID)
            folderName = folderName.split("/")
            folderName = folderName[folderName.length - 1].replace(".swf", "")
            if (!this.getTemplateValue(["PlantMovieClip"]) 
                && !this.zoneScene.cache.json.exists(`${templateID}-json`) // If the spine version is already cached, no need to check
                && (this.zoneScene.sharedData.global.stillImageEntities.has(templateID) // Using this to track missing spine files
                    || !urlExists(`${this.assetPath}/${folderName}/${spriteClass}/skeleton.atlas`))
            ) {
                this.zoneScene.sharedData.global.stillImageEntities.add(templateID)
                // TODO consider having the simple image sprites in one atlas file per swf file. Then, if not in there, we could assume it should use spine instead
                spriteType = this.SPRITE_TYPES.stillImage
                this.zoneScene.load.image(`${templateID}`, `${this.assetPath}/${folderName}/${spriteClass}/1.png`);
            } else {
                spriteType = this.SPRITE_TYPES.spine
                this.zoneScene.load.spineAtlas(`${templateID}-atlas`, `${this.assetPath}/${folderName}/${spriteClass}/skeleton.atlas`);
                this.zoneScene.load.spineJson(`${templateID}-json`, `${this.assetPath}/${folderName}/${spriteClass}/skeleton.json`);
            }
        }
        return spriteType
    }

    #loadSpawnerData() {
        let spawnerData = this.getTemplateValue(["EntitySpawning"])
        if (spawnerData) {
            this.isSpawner = true
            this.spawnerData = spawnerData
        } else {
            this.isSpawner = false
        }
    }
    // ------- END LOAD FUNCTIONS -------


    // ------- CREATE FUNCTIONS -------
    #createPlantData() {
        let plantData = this.getTemplateValue(["BasicGrowing"])
        if (plantData) {
            this.isPlant = true
            this.plantData = {
                growthData: plantData,
                spriteData: this.getTemplateValue(["PlantMovieClip"])
            }
            if (!this.isWilted) {
                this.isWilted = false
            }
            this.currentStage = 1
            this.timeToGrow = parseInt(this.plantData.growthData.fullGrowthTime[0].text)
        } else {
            this.isPlant = false
        }
    }
    #createSprite() {
        let isoStart = this.gridToIsoMap(this.startPos[0], this.startPos[1]);
        let xOffset = 0
        if (this.getTemplateValue(["Isometric", "xOffset"], this.templateID)) {
            xOffset = parseInt(this.getTemplateValue(["Isometric", "xOffset", "text"], this.templateID))
        }
        let yOffset = 0
        if (this.getTemplateValue(["Isometric", "yOffset"], this.templateID)) {
            yOffset = parseInt(this.getTemplateValue(["Isometric", "yOffset", "text"], this.templateID))
        }
        // TODO figure out actual values - only used bridge as ref so far
        isoStart.x = isoStart.x + (xOffset/6)
        isoStart.y = isoStart.y + (yOffset*23)

        if (this.spriteType === this.SPRITE_TYPES.spine) {
            try {
                this.sprite = this.zoneScene.add.spine(isoStart.x, isoStart.y, `${this.templateID}-json`, `${this.templateID}-atlas`).setScale();

            } catch (error) {
                console.log(`Could not load spine file for ${this.templateID}`)
            }
            this.resetSpriteFacingDirection()
            this.resetSpriteDepth()
            this.setAnimations()
            this.updateSprite()
        } else if (this.spriteType === this.SPRITE_TYPES.atlas) {
            this.sprite = this.zoneScene.add.sprite(isoStart.x, isoStart.y, `${this.templateID}`, "1").setOrigin(.5, 1)
            this.updateSprite()
        } else if (this.spriteType === this.SPRITE_TYPES.stillImage) {
            // For sprites where the bottom corner is aligned with the middle, bottom of the sprite
            this.sprite = this.zoneScene.add.image(isoStart.x, isoStart.y + 20, `${this.templateID}`).setOrigin(.5, 1)
            this.resetSpriteFacingDirection()
            this.resetSpriteDepth()
            this.updateSprite()
        }
    }
    setAnimations() {
        let character = this
        character.animationQueue = []
        character.idleAnimations = []
        if (character.sprite === undefined) { return }
        character.sprite.skeleton.data.animations.forEach(animation => {
            if (animation.name.includes("idle")) character.idleAnimations.push(animation.name)
        });

        if (character.idleAnimations.length > 0) {
            character.sprite.animationState.setAnimation(0, character.idleAnimations[Math.floor(Math.random()*this.idleAnimations.length)], false)
        }
        
        character.sprite.animationState.addListener({
                // start: (entry) => console.log(`Started animation ${entry.animation.name}`),
                // interrupt: (entry) => console.log(`Interrupted animation ${entry.animation.name}`),
                // end: (entry) => console.log(`Ended animation ${entry.animation.name}`),
                // dispose: (entry) => console.log(`Disposed animation ${entry.animation.name}`),
                complete: function endAnimation(entry) { 
                    if (character.animationQueue.length === 0) {
                        let animation = character.idleAnimations[Math.floor(Math.random()*character.idleAnimations.length)]
                        
                        const delay = 0//randomIntFromInterval(3, 5)
                        character.sprite.animationState.addAnimation(0, animation, false, delay);
                    }
                }
                // event: (entry, event) => console.log(`Custom event for ${entry.animation.name}: ${event.data.name}`)          
             })
    }
    // ------- END CREATE FUNCTIONS -------


    // ------- UPDATE FUNCTIONS -------
    getTimeDuration(countDay, countNight) {
        const timeData = this.zoneScene.sharedData.entities.timeTrackedEntities[this.zoneID][this.entityKey]

        if (timeData !== undefined) {
            if (!countNight && timeData.startTime > this.zoneScene.timeManager.dayLength) {
                timeData.startTime = 0
                timeData.daysCount--
            }
            // const dayZeroTime = this.zoneScene.timeManager.getCurrentTime() - timeData.startTime
            const dayDurationCount = countDay ? this.zoneScene.timeManager.dayLength : 0
            const nightDurationCount = countNight ? this.zoneScene.timeManager.nightLength : 0
            const fullDay = dayDurationCount + nightDurationCount
            const additionalTime = Math.max(this.zoneScene.timeManager.getCurrentTime() - timeData.startTime, 0)
            const duration = (fullDay * timeData.daysCount) + additionalTime
            return duration
        }
    }
    #tryGrow() {
        const plantData = this.plantData
        const growthType = plantData.growthData.growthType[0].text
        const timeType = this.zoneScene.timeManager.getCurrentTimeType()

        // Check for day/night, wilted and watered conditions
        if (!this.sprite
            || this.isWilted
            || !this.isWatered 
            || growthType !== timeType
        ) {
            return
        }

        // Check growth time
        const timeData = this.zoneScene.sharedData.entities.timeTrackedEntities[this.zoneID][this.entityKey]
        if (timeData !== undefined) {
            const countDay = growthType === "Day"
            const countNight = growthType === "Night"
            const duration = this.getTimeDuration(countDay, countNight)

            const stageTime = this.timeToGrow / parseInt(plantData.spriteData.stages[0].text)
            let currentStage = this.currentStage !== undefined ? this.currentStage : 1

            // TODO Check if we have any refs for how long plants took to wilt
            const dayDurationCount = countDay ? this.zoneScene.timeManager.dayLength : 0
            const nightDurationCount = countNight ? this.zoneScene.timeManager.nightLength : 0
            const fullDay = dayDurationCount + nightDurationCount
            const isWilted = duration > this.timeToGrow + fullDay

            const timeForCurrentStage = stageTime * currentStage;
            if (duration > timeForCurrentStage && currentStage < parseInt(plantData.spriteData.stages[0].text)) {
                currentStage++
            }
            if (isWilted) { currentStage++ }

            if (currentStage > this.currentStage) {
                this.currentStage = currentStage
                if (isWilted) {
                    this.isWilted = isWilted
                    this.zoneScene.sharedData.entities.spawnedEntities[this.zoneScene.sharedData.global.currentZone][this.entityKey].respawnConfig.isWilted = isWilted
                    this.updateSprite()
                } else {
                    this.updateSprite()

                    // Give magic to the tree on first full growth
                    if (parseInt(plantData.spriteData.stages[0].text) === this.currentStage && !this.hasGivenMagic)
                    {
                        // See if plant growth triggers any quests
                        let triggerData = {
                            type: "PlantGrownInRadiusTrigger",
                            templateID: this.templateID,
                            zoneID: this.zoneID,
                            x: this.startPos[0],
                            y: this.startPos[1],
                        }
                        this.zoneScene.sharedData.quest.manager.tryTriggerQuest(this.zoneScene, triggerData)
                        
                        // Update growth data and respawn config
                        this.hasGivenMagic = true;
                        this.zoneScene.sharedData.entities.spawnedEntities[this.zoneScene.sharedData.global.currentZone][this.entityKey].respawnConfig.hasGivenMagic = this.hasGivenMagic
                        this.zoneScene.sharedData.magicTree.logic.manager.addExperience(parseInt(plantData.growthData.magic[0].text));
                        this.zoneScene.sharedData.hud.ui.manager.playLevelSparkle()
                    }
                }
            }
        }
    }

    #trySpawn() {
        const spawnerData = this.spawnerData
        const spawnTimeType = spawnerData.spawnTimeType[0].text

        // Check for day/night spawn conditions
        if (spawnTimeType !== this.zoneScene.timeManager.getCurrentTimeType()) { 
            return
        }

        // Check spawn time has elapsed
        const timeData = this.zoneScene.sharedData.entities.timeTrackedEntities[this.zoneID][this.entityKey]
        // const oldTimeData = structuredClone(timeData)
        if (timeData !== undefined) {
            const countDay = spawnTimeType === "Day"
            const countNight = spawnTimeType === "Night"
            const duration = this.getTimeDuration(countDay, countNight)
            if (duration < parseFloat(spawnerData.entitySpawnTime[0].text)) {return}
        } else {
            this.zoneScene.sharedData.entities.timeTrackedEntities[this.zoneID][this.entityKey] = {}
            this.resetTimeData()
            return
        }

        // Reset spawn time
        this.resetTimeData()

        // Check if spawning is blocked
        if (this.zoneScene.sharedData.disableSpawns) {return}
        const spawnType = spawnerData.spawnType
        const entities = this.zoneScene.getEntitiesAt(this.startPos[0], this.startPos[1])
        if (entities !== undefined) {
            for (let index = 0; index < entities.length; index++) {
                const entity = this.zoneScene.entities[entities[index]].templateID
                let blocksSpawn = this.getTemplateValue(["GridPosition", "blocksSpawn", "text"], entity)
                if (blocksSpawn === "True") { return }
                // TODO figure out why this is still allowing spawns through
                for (let index = 0; index < spawnType.length; index++) {
                    if (spawnType[index].text === entity) {return}
                }
            }
        }

        // If all conditions met, try spawning
        const random = Math.random()
        // console.log(this.entityKey, oldTimeData, this.zoneScene.timeManager.getCurrentTime() - oldTimeData.startTime)
        let chanceCounter = 0
        for (let index = 0; index < spawnType.length; index++) {
            const type = spawnType[index];

            chanceCounter = chanceCounter + parseFloat(type.chance)
            if (random <= chanceCounter) {
                this.zoneScene.spawnEntity(type.text, this.startPos[0], this.startPos[1])
                return
            }
        }
    }

    resetTimeData(startDuration = 0) {
        const timeData = this.zoneScene.sharedData.entities.timeTrackedEntities[this.zoneID][this.entityKey]
        
        timeData.startTime = this.zoneScene.timeManager.getCurrentTime() - startDuration
        timeData.daysCount = 0
    }


    updateSprite() {
        if (!this.isPlant || !this.sprite || !this.sprite.skeleton) { 
            super.updateSprite()
            return
         }
        let gameTime = this.zoneScene.timeManager.isDay ? 'day' : 'night'
        const skeletonData = this.sprite.skeleton.data;
        const skin = new spine.Skin("custom");

        const baseName = this.templateID.replace("Template", "")
        let stageName = `${baseName}/${this.currentStage}`
        if (this.isWilted) { stageName = `${this.templateID.replace("Template", "")}/Wilted` }

        if (skeletonData.findSkin(stageName) !== null){
            skin.addSkin(skeletonData.findSkin(stageName));
        }
        else if (skeletonData.findSkin(stageName + '_' + gameTime) !== null){
            skin.addSkin(skeletonData.findSkin(stageName + '_' + gameTime));
        }  else {
            console.warn(`Could not find skins ${stageName} or ${stageName + '_' + gameTime}`)
        }
        this.sprite.skeleton.setSkin(skin);
        this.sprite.skeleton.setToSetupPose();

        for (let index = 0; index < this.sprite.skeleton.data.animations.length; index++) {
            if (this.sprite.skeleton.data.animations[index].name === "idle0") {
                this.sprite.animationState.addAnimation(1, "idle0", true)
            }
        }
        super.updateSprite()
    }
    // ------- END UPDATE FUNCTIONS -------


    // ------- GRID TILE FUNCTIONS -------
    gridFootDirectionsSwapped() {
        switch (this.facingDirection) {
            case this.FACING_DIRECTIONS.Southwest:
            case this.FACING_DIRECTIONS.Northeast:
                return true
                break;
            default:
                return false
                break;
        }
    }
    // Set
    #setGridTileData() {
        // Get gridFootData from template
        this.gridFootX = this.getTemplateValue(["GridPosition", "gridFootX", "text"])
            this.gridFootX = this.gridFootX === undefined ? 1 : parseInt(this.gridFootX)

        this.gridFootY = this.getTemplateValue(["GridPosition", "gridFootY", "text"])
            this.gridFootY = this.gridFootY === undefined ? 1 : parseInt(this.gridFootY)

        // Add entity data to tiles
        for (let x = 0; x < this.gridFootX; x++) {
            for (let y = 0; y < this.gridFootY; y++) {
                let tile
                if (this.gridFootDirectionsSwapped()) {
                    tile = this.zoneScene.getTileAt(this.startPos[0]+y, this.startPos[1]-x)
                } else {
                    tile = this.zoneScene.getTileAt(this.startPos[0]+x, this.startPos[1]-y)
                }

                if (!tile.hasEntity) {
                    tile.hasEntity = []
                }
                tile.hasEntity.push(this.entityKey)
            }
        }
    }
    // Remove
    removeGridTileData() {
        if ( this.gridFootX === undefined) { this.gridFootX = 1}
        if ( this.gridFootY === undefined) { this.gridFootY = 1}
        for (let x = 0; x < this.gridFootX; x++) {
            for (let y = 0; y < this.gridFootY; y++) {
                let tile
                if (this.gridFootDirectionsSwapped()) {
                    tile = this.zoneScene.getTileAt(this.startPos[0]+y, this.startPos[1]-x)
                } else {
                    tile = this.zoneScene.getTileAt(this.startPos[0]+x, this.startPos[1]-y)
                }
                
                const index = tile.hasEntity.indexOf(this.entityKey);
                if (index !== -1) {
                    tile.hasEntity.splice(index, 1);
                }
            }
        }
    }
    // Update
    updateGridTileData() {
        const bigger = this.gridFootX > this.gridFootY ? this.gridFootX : this.gridFootY
        const smaller = this.gridFootX < this.gridFootY ? this.gridFootX : this.gridFootY

        for (let i = smaller; i < bigger; i++) {
            for (let j = 0; j < smaller; j++) {
                let oldTile
                let newTile

                if (this.gridFootDirectionsSwapped()) {
                    oldTile = this.zoneScene.getTileAt(this.startPos[0]+j, this.startPos[1]-i)
                    newTile = this.zoneScene.getTileAt(this.startPos[0]+i, this.startPos[1]-j)
                } else {
                    oldTile = this.zoneScene.getTileAt(this.startPos[0]+i, this.startPos[1]-j)
                    newTile = this.zoneScene.getTileAt(this.startPos[0]+j, this.startPos[1]-i)
                }

                // Deletes the entity from the old tile
                if (oldTile && oldTile.hasEntity) {
                    let index = oldTile.hasEntity.indexOf(this.entityKey);
                    if (index !== -1) {
                        oldTile.hasEntity.splice(index, 1);
                    }
                }

                // Adds the entity to the new tile
                if (newTile) {
                    if (newTile.hasEntity) {
                        let index = newTile.hasEntity.indexOf(this.entityKey)
                        if (index === -1) {
                            newTile.hasEntity.push(this.entityKey);
                        } else {
                        }
                    } else {
                        newTile.hasEntity = [this.entityKey]
                    }
                }
            }
        }
    }
    // Get
    getCurrentGridTileData() {
        if (this.gridFootDirectionsSwapped()) {
            return {x: this.gridFootY, y: this.gridFootX}
        } else {
            return {x: this.gridFootX, y: this.gridFootY}
        }
    }

    debugGridTileData() {
        const bigger = this.gridFootX > this.gridFootY ? this.gridFootX : this.gridFootY
        const tiles = []

        for (let i = 0; i < bigger; i++) {
            for (let j = 0; j < bigger; j++) {
                let tile = this.zoneScene.getTileAt(this.startPos[0]+j, this.startPos[1]-i)
                tiles.push(tile)
            }
        }
        console.log("Tile data for", this.entityKey, tiles)
    }
    // ------- GRID TILE FUNCTIONS -------


    // ------- COMMAND FUNCTIONS -------
    // These functions are used to handle player interactions as defined in each entity's template
    /**
     * Is used when the player clicks on a tile containing this entity
     * @param {*} interactData any data about the interaction that should be passed in
     */
    getInteractOptions(interactData) {
        const allInteractions = [
            "TalkCommand",
            "GiveCommand",
            "ApplyCommand",
            "TakeCommand",
            "TrashCommand",
            "ShopCommand",
            "MoveCommand",
            "InteractCommand",
            "BrushCommand",
            "WaterPlantCommand",
            "UprootCommand",
            "VariantCommand",
            "RotateCommand"
        ]
        const entityInteractions = []

        if (this.getTemplateValue(["BasicGrowing", "type"]) === "components.FruitGrowingComponent") {
            entityInteractions.push("CollectPlantCommand")
        } else if (this.isPlant) {
            entityInteractions.push("TakePlantCommand")
        }


        if (this.getTemplateValue(["Click", "name"])) {
            for (let index = 0; index < allInteractions.length; index++) {
                const interaction = allInteractions[index];
                if (this.getTemplateValue([interaction, "name"])) {
                    entityInteractions.push(interaction)
                }
            }
        }

        return entityInteractions
    }

    // These functions are used to handle player interactions as defined in each entity's template
    /**
     * Is used when the player clicks on a tile containing this entity
     * @param {*} interactData any data about the interaction that should be passed in
     */
    interact(interactData) {
        if (this.getTemplateValue(["Click", "name"])) {
            const interactions = {
                Give: this.#giveCommand,
                Apply: this.#applyCommand,
                Take: this.#takeCommand,
                Trash: this.#trashCommand,
                Talk: this.#talkCommand,
                Shop: this.#shopCommand,
                Move: this.#moveCommand,
                Interact: this.#interactCommand,
                Brush: this.#brushCommand,
                Water: this.#waterPlantCommand,
                Uproot: this.#uprootPlantCommand,
                Collect: this.#collectCommand,
                Variant: this.#variantCommand,
                Rotate: this.#rotateCommand
            }
            interactions[interactData.interactionType](this, interactData)
            return true
        }
        return false
    }
    returnItem(itemTemplate) {
        // console.log(`Got ${itemTemplate}. Mode is ${this.itemRequestType}`)
        let triggerData
        
        this.zoneScene.sharedData.inventory.ui.manager.hide()

        switch (this.itemRequestType) {
            case this.ITEM_REQUEST_TYPES.give:
                triggerData = {
                    type: "GiveItemTrigger",
                    inventoryTemplate: itemTemplate,
                    templateID: this.templateID
                }
                this.zoneScene.sharedData.quest.manager.tryTriggerQuest(this.zoneScene, triggerData)
                this.zoneScene.sharedData.inventory.manager.removeItem(itemTemplate)
                
                break;
            case this.ITEM_REQUEST_TYPES.apply:
                triggerData = {
                    type: "ApplyItemTrigger",
                    inventoryTemplate: itemTemplate,
                    templateID: this.templateID
                }
                this.zoneScene.sharedData.quest.manager.tryTriggerQuest(this.zoneScene, triggerData)
                
                break;
        
            default:
                break;
        }

        this.itemRequestType = this.ITEM_REQUEST_TYPES.none
    }

    #giveCommand(context, interactData) {
        /*
        * Click entity to see giveCommand option
        * Select giveCommand option
        * Inventory menu appears with the available giveItem options visible
        * User can then select a giveItem item to give
        * giveItem is removed from inventory
        */
        const giveItem = context.getGiveItems()
        context.itemRequestType = context.ITEM_REQUEST_TYPES.give
        context.zoneScene.sharedData.inventory.ui.manager.show(giveItem, context);
    }
    canGive(checkApplyInstead = false) {
        const items = this.getGiveItems()
        if (items.length === 0) return false
        const haveItems = this.zoneScene.sharedData.inventory.manager.getItemByTemplates(items)
        return Object.entries(haveItems).length > 0
    }
    getGiveItems(checkApplyInstead = false) {  
        const activeQuests = []
        for (let index = 0; index < this.zoneScene.sharedData.quest.logic.activeQuests.length; index++) {
            const questID = this.zoneScene.sharedData.quest.logic.activeQuests[index];
            activeQuests.push(this.zoneScene.sharedData.quest.manager.getQuestPerID(questID))
        }

        const itemsToCheck = this.getTemplateValue(["GiveCommand", "item"])

        const items = []
        for (let index = 0; index < activeQuests.length; index++) {
            const quest = activeQuests[index];

            for (let lineIndex = 0; lineIndex < quest.line.length; lineIndex++) {
                let triggerData = quest.line[lineIndex].trigger.object[0];
                if((checkApplyInstead && triggerData.type !== "GiveItemTrigger") || (checkApplyInstead && triggerData.type !== "ApplyItemTrigger")) continue

                if (triggerData.targetTemplate && triggerData.targetTemplate[0] === this.templateID 
                ) {
                    items.push({text: triggerData.inventoryTemplate[0], count: 1})
                }
            }
        }
        return items
    }

    #applyCommand(context, interactData) { 
        const applyItem = context.getTemplateValue(["ApplyCommand", "item"])
        context.itemRequestType = context.ITEM_REQUEST_TYPES.apply
        context.zoneScene.sharedData.inventory.ui.manager.show(applyItem, context);
    }
    #takeCommand(context, interactData) {
        let takeItem
        // Check if takePlantCommand or takeCommand
        if (context.getTemplateValue(["TakePlantCommand"])) {
            if (!context.isWilted && context.currentStage === parseInt(context.getTemplateValue(["PlantMovieClip", "stages", "text"]))) {
                takeItem = context.getTemplateValue(["BasicGrowing", "harvestProduceItemId", "text"])
                const triggerInfo = {
                    type: "ContextItemTrigger",
                    actionClass: "take",
                    template: context.templateID
                }
                context.zoneScene.sharedData.quest.manager.tryTriggerQuest(context.zoneScene, triggerInfo)
                
                const harvestTriggerInfo = {
                    type: "ActionTrigger",
                    actionClass: "HarvestProduceAction",
                    template: context.templateID
                }
                context.zoneScene.sharedData.quest.manager.tryTriggerQuest(context.zoneScene, harvestTriggerInfo)
            } else {
                console.log("Plant not correct stage")
            }
        } else if (context.getTemplateValue(["TakeCommand"])) {
            takeItem = context.getTemplateValue(["TakeCommand", "template", "text"])
            const triggerData = {
                type: "ContextItemTrigger",
                actionClass: "take",
                template: context.templateID
            }
            context.zoneScene.sharedData.quest.manager.tryTriggerQuest(context.zoneScene, triggerData)
        }

        if (takeItem == undefined) { return }
        context.zoneScene.sharedData.inventoryAnimation.ui.manager.show(takeItem, 1, true)
        context.zoneScene.sharedData.inventory.manager.addItem(takeItem)

        // TODO check if this part is correct (may be different for plants as well, since they use different take/harvest logic)

        context.destroy()
    }
    #collectCommand(context, interactData) { 
        let takeItem
        // Check if takePlantCommand or takeCommand
        if (context.getTemplateValue(["CollectPlantCommand"])) {
            if (!context.isWilted && context.currentStage === parseInt(context.getTemplateValue(["PlantMovieClip", "stages", "text"]))) {
                takeItem = context.getTemplateValue(["BasicGrowing", "harvestProduceItemId", "text"])
                const triggerInfo = {
                    type: "ContextItemTrigger",
                    actionClass: "collect",
                    template: context.templateID
                }
                context.zoneScene.sharedData.quest.manager.tryTriggerQuest(context.zoneScene, triggerInfo)

                const harvestTriggerInfo = {
                    type: "ActionTrigger",
                    actionClass: "HarvestProduceAction",
                    template: context.templateID
                }
                context.zoneScene.sharedData.quest.manager.tryTriggerQuest(context.zoneScene, harvestTriggerInfo)
                
                console.log("harvest", takeItem)
            } else {
                console.log("Plant not correct stage")
            }
        }

        if (takeItem == undefined) { return }

        context.zoneScene.sharedData.inventoryAnimation.ui.manager.show(takeItem, 1, true)
        context.zoneScene.sharedData.inventory.manager.addItem(takeItem)


        // TODO currently doesn't regrow - add regrowth ability
        this.currentStage = parseInt(context.plantData.growthData.unWiltStage[0].text)
        this.timeToGrow = parseInt(context.plantData.growthData.reGrowthTime[0].text)
        context.zoneScene.sharedData.entities.timeTrackedEntities[context.zoneID][context.entityKey] = {
            startTime: context.zoneScene.timeManager.getCurrentTime(),
            daysCount: 0
        }
    }
    #trashCommand(context, interactData) {
        /*
        * Click entity to see trashCommand option
        * Select trashCommand option
        * Entity is removed from world
        */
        context.destroy()
    }
    #talkCommand(context, interactData) {
        const talkData = context.getTalkData()
        const character = context.getTemplateValue(["Character", "identifier", "text"])
        if (talkData.quests.length > 0 ) {
            talkData.choices["none"] = {
                entityID: character,
                text: context.zoneScene.sharedData.ui.localization.items[0].dialogueCancel[0].text
            }
            context.zoneScene.sharedData.dialogue.ui.manager.show(null, character, context.zoneScene.sharedData.ui.localization.items[0].dialogueChoiceText[0].text, talkData.choices); 
        } else if (talkData.default.length > 0) {
            context.zoneScene.sharedData.dialogue.ui.manager.show(null, character, talkData.default[randomIntFromInterval(0, talkData.default.length-1)]); 
        }
    }
    getTalkData() {
        const character = this.getTemplateValue(["Character", "identifier", "text"])
        let talkDefault = this.getTemplateValue(["TalkCommand", "text"])
        if (talkDefault === undefined || this.templateID === "M005gTemplate") {talkDefault = []}
        else if (!Array.isArray(talkDefault)) { talkDefault = [talkDefault]}
        const choices = { }
        const quests = this.zoneScene.sharedData.quest.manager.getActiveQuestsWithCharacter(character)
        for (let index = 0; index < quests.length; index++) {
            const quest = quests[index];
            const advData = this.zoneScene.sharedData.quest.manager.getAdventurePerID(quest)
            choices[quest[2]] = {
                entityID: character,
                text: advData.description.text
            }
        }
        return {quests: quests, choices:choices, default: talkDefault}
    }
    #shopCommand(context, interactData) {
        if (context.getTemplateValue(["AvatarShopCommand"])) {
            console.log("Avatar shop not yet implemented")
        } else {
            console.log("Shop not yet implemented")
        }
    }
    #moveCommand(context, interactData) { 
        console.log("Move not yet implemented")
    }
    #interactCommand(context, interactData) { 
        console.log("Interact not yet implemented")
    }
    #brushCommand(context, interactData) { 
        const triggerInfo = {
            type: "ContextItemTrigger",
            actionClass: "brush",
            template: context.templateID
        }
        context.zoneScene.sharedData.quest.manager.tryTriggerQuest(context.zoneScene, triggerInfo)
        console.log("Brush not yet implemented")
    }
    #waterPlantCommand(context, interactData) { 
        if (context.zoneScene.sharedData.entities.timeTrackedEntities[context.zoneID][context.entityKey] === undefined) {
            context.zoneScene.sharedData.entities.timeTrackedEntities[context.zoneID][context.entityKey] = {
                startTime: context.zoneScene.timeManager.getCurrentTime(),
                daysCount: 0
            }
        }
        context.isWatered = true
        context.zoneScene.sharedData.entities.spawnedEntities[context.zoneScene.sharedData.global.currentZone][context.entityKey].respawnConfig.isWatered = true

        const triggerInfo = {
            type: "ActionTrigger",
            actionClass: "WaterPlantAction",
            template: context.templateID
        }
        context.zoneScene.sharedData.quest.manager.tryTriggerQuest(context.zoneScene, triggerInfo)
    }
    #uprootPlantCommand(context, interactDat) { 
        let takeItem
        if (context.getTemplateValue(["UprootCommand"])) {
                takeItem = context.getTemplateValue(["BasicGrowing", "harvestSeedsItemId", "text"])
                // const triggerInfo = {
                //     type: "ContextItemTrigger",
                //     actionClass: "uproot", // ?
                //     template: context.templateID
                // }
                // context.zoneScene.sharedData.quest.manager.tryTriggerQuest(context.zoneScene, triggerInfo)
        }

        if (takeItem == undefined) { return }
        context.zoneScene.sharedData.inventory.manager.addItem(takeItem)
        context.destroy(true)
    }
    #variantCommand(context, interactData) { 
        let possibleVariants = context.getTemplateValue(["MovieClip", "variants"]);
        if (possibleVariants === undefined) { return; }

        let variantFound = false;
        if (context.variant === context.getTemplateValue(["MovieClip", "className", "text"], this.templateID))
        {
            variantFound = true;
        }
        for (let [key] of Object.entries(possibleVariants)) {
            if (key === "childType") {continue;}

            if (key === context.variant)
            {
                variantFound = true;
                continue;
            }

            if (variantFound)
            {
                variantFound = false;
                context.variant = key;
                break;
            }
        }

        if (variantFound)
        {
            context.variant = context.getTemplateValue(["MovieClip", "className", "text"], context.templateID);
        }

        
        context.zoneScene.sharedData.entities.spawnedEntities[context.zoneScene.sharedData.global.currentZone][context.entityKey].respawnConfig.variant = context.variant;
        context.updateSpriteVariant(context.variant);
    }
    
    #rotateCommand(context, interactData) { 
        switch(context.facingDirection) {
            default:
            case context.FACING_DIRECTIONS.Northwest:
                context.facingDirection = context.FACING_DIRECTIONS.Southwest;
                break;
            case context.FACING_DIRECTIONS.Southwest:
                context.facingDirection = context.FACING_DIRECTIONS.Southeast;
                break;
            case context.FACING_DIRECTIONS.Southeast:
                context.facingDirection = context.FACING_DIRECTIONS.Northeast;
                break;
            case context.FACING_DIRECTIONS.Northeast:
                context.facingDirection = context.FACING_DIRECTIONS.Northwest;
                break;
        }
        context.updateGridTileData()
        context.resetSpriteFacingDirection()
        context.zoneScene.sharedData.entities.spawnedEntities[context.zoneScene.sharedData.global.currentZone][context.entityKey].respawnConfig.facingDirection = context.facingDirection;
    }


    // ------- END COMMAND FUNCTIONS -------


    // ------- HELPER FUNCTIONS -------
    getTemplateValue(keys, templateID = this.templateID) {
        // console.log(templateID + " " + keys + ": " + this.zoneScene.sharedData.template.manager.getTemplateValue(`${templateID}`, keys))
        return this.zoneScene.sharedData.template.manager.getTemplateValue(`${templateID}`, keys)
    }

    destroy (ignoreRemoveEntityTrigger = false) {
        const nearbyEntities = new Set()
        for (let x = 0; x < this.gridFootX; x++) {
            for (let y = 0; y < this.gridFootY; y++) {
                const entities = this.zoneScene.getEntitiesAt(this.startPos[0]+x, this.startPos[1]-y)
                for (let index = 0; index < entities.length; index++) {
                    nearbyEntities.add(this.zoneScene.entities[entities[index]].templateID)
                }
            }
        }

        for (const entity of nearbyEntities) {
            const otherEntity = this.zoneScene.entities[entity]
            if (otherEntity=== undefined) {continue}

            // Check for any triggers
            if (!ignoreRemoveEntityTrigger) {
                const triggerInfo = {
                    type: "RemoveEntityTrigger",
                    templateID: this.templateID,
                    targetTemplate: otherEntity.templateID
                }
                this.zoneScene.sharedData.quest.manager.tryTriggerQuest(this.zoneScene, triggerInfo)
            }

            // Reset any spawners
            if (otherEntity.isSpawner) {
                for (let index = 0; index < otherEntity.spawnerData.spawnType.length; index++) {
                    const spawnsTemplate = otherEntity.spawnerData.spawnType[index];
                    if (spawnsTemplate.text === this.templateID) {
                        otherEntity.resetTimeData()
                        break
                    }
                }
            }
        }

        // Removes the sprite for the entity
        if (this.sprite) { this.sprite.destroy() }

        // Removes the entity from the tiles it is on
        this.removeGridTileData()

        // Removes the entity from the zone
        delete this.zoneScene.sharedData.entities.spawnedEntities[this.zoneScene.zoneConfig.ID][this.entityKey]
        delete this.zoneScene.sharedData.entities.timeTrackedEntities[this.zoneScene.zoneConfig.ID][this.entityKey]
        delete this.zoneScene.entities[this.entityKey]
    }
    // ------- END HELPER FUNCTIONS -------
}