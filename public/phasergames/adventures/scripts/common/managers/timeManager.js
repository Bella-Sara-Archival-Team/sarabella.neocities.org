class TimeManager
{
    // TODO: Refactor the heck outta this

    constructor(phaserScene)
    {
        this.phaserScene = phaserScene;
        this.phaserScene.sharedData.timeManager = this
        if (this.phaserScene.sharedData.global.timePausedAt) {
            this.startAt = this.phaserScene.sharedData.global.timePausedAt
        } else {
            this.phaserScene.load.plugin('rexclockplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexclockplugin.min.js', true);
            this.startAt = this.phaserScene.sharedData.saving.getGameData(GAME_DATA_TYPE.time);
            if (isNaN(this.startAt)) {
                this.startAt = 0;
            }
        }
        this.isDay = true
        this.nightLength = 30000 // should be 30000
        this.dayLength = 180000 // should be 180000
    }

    /**
     * Starts the clock
     */
    startClock() {
        this.clock = this.phaserScene.plugins.get('rexclockplugin').add(this.phaserScene, config);
        this.clock.start(this.startAt);
        if (this.getCurrentTimeType() === "Night") {
            this.isDay = false
        }
    }

    /**
     * Changes the tint of a given sprite. Is used to render day and night cycle.
     * Any slots with names that include _night will render as day/night
     * Slot names without _night will render as day only
     * @param {*} sprite 
     * @param {*} r 
     * @param {*} g 
     * @param {*} b 
     * @param {*} shade 
     * @param {*} a 
     */
    changeTint(sprite, r, g, b, shade, a) {
        if (sprite === undefined) {return}
        let layers = []
        sprite.slots.forEach(slot => {
            if (slot.data.name.includes("_night")) {
                layers.push(slot.data.name)
            }

        })
        layers.forEach(part => {
            var slot = sprite.findSlot(`${part}`)
            slot.color.r = r
            slot.color.g = g
            slot.color.b = b
            slot.color.a = a
            
            if (shade !== 0) {
                slot.darkColor = {r: r-shade, g: g-shade, b: b-shade, a: 1}
            } else {
                slot.darkColor = null
            }
        });
    }

    setTile(tile, cellValue) {
        if (!tile.skeleton) { return }
        let gameTime = this.isDay ? 'day' : 'night'
        const skeletonData = tile.skeleton.data;
        const skin = new spine.Skin("custom");
        if (skeletonData.findSkin(cellValue) !== null){
            skin.addSkin(skeletonData.findSkin(cellValue));
        }
        else if (skeletonData.findSkin(cellValue + '/' + gameTime) !== null){
            skin.addSkin(skeletonData.findSkin(cellValue + '/' + gameTime));
        }   
        tile.skeleton.setSkin(skin);
        tile.skeleton.setToSetupPose();

        for (let index = 0; index < tile.skeleton.data.animations.length; index++) {
            if (tile.skeleton.data.animations[index].name === "idle0") {
                tile.animationState.addAnimation(1, "idle0", true)
            }
        }
    }

    /**
     * Updates tile sprites
     */
    updateSprites() {
        // Column
        for (var y = 0; y < Object.keys(this.phaserScene.tiles).length; y++)
            {
                // Row
                for (var x = 0; x < Object.keys(this.phaserScene.tiles[y]).length; x++)
                {
                    let tile = this.phaserScene.tiles[y][x]
                    var cellValue = this.phaserScene.tiles[y][x].parsedData.id
                    this.setTile(tile, cellValue)
                }
            }

        // Entities
        for (let [key] of Object.entries(this.phaserScene.entities))
            {
                this.phaserScene.entities[key].updateSprite()
            }
    }

    /**
     * Updates sprites to render day/night
     */
    renderDayNight() {
        this.updateSprites()
        if (this.isDay) {
            this.phaserScene.backgrounds.forEach(background => {
                background.clearTint()
            });
            for (var y = 0; y < Object.keys(this.phaserScene.tiles).length; y++)
                {
                    // Row
                    for (var x = 0; x < Object.keys(this.phaserScene.tiles[y]).length; x++)
                    {
                        let tile = this.phaserScene.tiles[y][x];
                        for (let i = 0; i < Object.keys(tile).length; i++)
                        {
                            let index = Object.keys(tile)[i];
                            if (tile[index].skeleton !== undefined)
                            {
                                this.changeTint(tile[index].skeleton, 0, 0.2, 0.4, 0, 0)
                            }
                        }
                    }
                }
        } else {
            this.phaserScene.backgrounds.forEach(background => {
                background.setTint('0x003366') // , '0x121287'
            });
            for (var y = 0; y < Object.keys(this.phaserScene.tiles).length; y++){
                // Row
                for (var x = 0; x < Object.keys(this.phaserScene.tiles[y]).length; x++)
                {
                    let tile = this.phaserScene.tiles[y][x];
                    for (let i = 0; i < Object.keys(tile).length; i++)
                    {
                        let index = Object.keys(tile)[i];
                        if (tile[index].skeleton !== undefined)
                        {
                            this.changeTint(tile[index].skeleton, 0, 0.2, 0.4, 0, .75)
                        }
                    }
                }
            }
        }
    }

    updateTime() {
        if (this.clock.now >= this.dayLength + this.nightLength) {
            this.clock.seek(0)
            this.isDay = true
            this.renderDayNight()
            for (let [key] of Object.entries(this.phaserScene.sharedData.entities.timeTrackedEntities)) {
                const zoneEntities = this.phaserScene.sharedData.entities.timeTrackedEntities[key]
                if (zoneEntities === undefined) {
                    continue
                }
                for (let [key] of Object.entries(zoneEntities)) {
                    try {
                        zoneEntities[key].daysCount++
                    } catch (error) {
                        console.error("Could not update dayCount for", key, error)
                    }
                }
            }
        } else if (this.clock.now >= this.dayLength && this.isDay) {
            this.isDay = false
            this.renderDayNight()
        }

        // HUD Time Indicator
        if (this.phaserScene.sharedData.hud === undefined 
            || this.phaserScene.sharedData.hud.ui === undefined 
            || this.phaserScene.sharedData.hud.ui.timeIndicator === undefined
        ) return;
        if (this.clock.now <= this.dayLength/3) {
            this.phaserScene.sharedData.hud.ui.timeIndicator.setFrame('day1')
        } else if (this.clock.now <= this.dayLength*2/3) {
            this.phaserScene.sharedData.hud.ui.timeIndicator.setFrame('day2')
        } else if (this.clock.now <= this.dayLength) {
            this.phaserScene.sharedData.hud.ui.timeIndicator.setFrame('day3')
        } else if (this.clock.now <= this.dayLength + this.nightLength/3) {
            this.phaserScene.sharedData.hud.ui.timeIndicator.setFrame('night1')
        } else if (this.clock.now <= this.dayLength + this.nightLength*2/3) {
            this.phaserScene.sharedData.hud.ui.timeIndicator.setFrame('night2')
        } else {
            this.phaserScene.sharedData.hud.ui.timeIndicator.setFrame('night3')
        }


        const zoneEntities = this.phaserScene.sharedData.entities.timeTrackedEntities[this.phaserScene.zoneConfig.ID]
        for (let [key] of Object.entries(zoneEntities)) {
            if (this.phaserScene.entities[key] === undefined) {
                continue
            }
            this.phaserScene.entities[key].update()
        }
    }

    getCurrentTime() {
        let currentTime = 0
        if (this.clock && this.clock.now) {
            currentTime = this.clock.now
        } else if (this.phaserScene.sharedData.global.timePausedAt) {
            currentTime = this.phaserScene.sharedData.global.timePausedAt
        }
        return currentTime
    }

    getCurrentTimeType() {
        if (this.getCurrentTime() <= this.dayLength) {
            return "Day"
        } else {
            return "Night"
        }
    }
}