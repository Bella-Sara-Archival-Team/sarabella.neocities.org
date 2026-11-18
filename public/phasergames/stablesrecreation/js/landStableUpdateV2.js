class LandStable extends Phaser.Scene
{
    constructor ()
    {
        super({
            key: 'landStable'
        });
    }

    preload ()
    {  
        const game = this
        game.stablesManager = new StablesManager(game)

        // LOADING BAR
        this.stablesManager.preloadDisplayLoadBar()
            
        // Load in images and sounds
        if (horseName === "ronnie") {
            game.load.image('stable_bg', './images/landStable/stable-bg-winter.png');
        } else {
            game.load.image('stable_bg', './images/landStable/stable-bg.png');
        }
        game.load.image('stable_fg', './images/landStable/stable-fg.png');
        game.load.image('hunger_scale', './images/landStable/hunger.png');
        game.load.image('cleanliness_scale', './images/landStable/cleanliness.png');
        game.load.image('happiness_scale', './images/landStable/happiness.png');

        game.load.atlas('shovel', './images/landStable/shovel.png', './images/landStable/shovel.json');
        game.load.atlas('fork', './images/landStable/fork.png', './images/landStable/fork.json');
        game.load.atlas('straw1', './images/landStable/straw1.png', './images/landStable/straw1.json');
        game.load.atlas('straw2', './images/landStable/straw2.png', './images/landStable/straw2.json');
        game.load.atlas('straw3', './images/landStable/straw3.png', './images/landStable/straw3.json');
        game.load.atlas('hay_loft', './images/landStable/hay_loft.png', './images/landStable/hay_loft.json');
        game.load.atlas('awards', './images/landStable/awards.png', './images/landStable/awards.json');

        game.load.atlas('trough', './images/landStable/water.png', './images/landStable/water.json');
        game.load.atlas('trough_mask', './images/landStable/water_mask.png', './images/landStable/water_mask.json');
        game.load.atlas('food_trough', './images/landStable/food.png', './images/landStable/food.json');
        game.load.atlas('food_trough_small', './images/landStable/food_small.png', './images/landStable/food_small.json');
        game.load.atlas('grain_bin', './images/landStable/grain_bin.png', './images/landStable/grain_bin.json');
        game.load.image('grain_scoop', './images/landStable/grain_scoop.png');
        game.load.atlas('appleBin', './images/landStable/apples.png','./images/landStable/apples.json');
        game.load.image('apple', './images/landStable/apple.png');
        
        game.load.atlas('brush', './images/landStable/brush.png', './images/landStable/brush.json');
        game.load.atlas('brush_small', './images/landStable/brush_small.png', './images/landStable/brush_small.json');
        game.load.atlas('hoofpick', './images/landStable/hoofpick.png', './images/landStable/hoofpick.json');
        
        this.stablesManager.preloadHorse('land');
        game.load.spritesheet('hooves', './images/landStable/hooves.png', { frameWidth: 53, frameHeight: 53 });

        game.load.atlas('luck', './images/landStable/luck.png', './images/landStable/luck.json');
        game.load.atlas('frame', './images/landStable/frame.png', './images/landStable/frame.json');
        game.load.image('inspiration', './images/landStable/inspiration.png');

        game.load.atlas('music_button', './images/landStable/music.png', './images/landStable/music.json');
        game.load.atlas('help_button', './images/landStable/help.png', './images/landStable/help.json');
        game.load.image('stat_box', './images/StatBox.png');
        game.load.image('goworld_box', './images/landStable/ToWorldBox.png');

        game.stablesManager.preloadAudio({
            'luckSound': `./sounds/luck_sound.mp3`,
            'waterDrink': `./sounds/water_drink.mp3`,
            'waterSound': `./sounds/water_sound.mp3`,
            'forkFill': `./sounds/fork_fill.mp3`,
            'forkPlace': `./sounds/fork_place.mp3`,
            'shovelSound': `./sounds/shovel_sound.mp3`,
            'grainSound': `./sounds/grain_sound.mp3`,
            'hoofpick1': `./sounds/hoofpick1.mp3`,
            'hoofpick2': `./sounds/hoofpick2.mp3`
        })
    }

    create (data)
    {
        const game = this
        game.data = data;
        game.stablesManager.createScene()


        // Straw (on floor)
        const straw2 = game.add.sprite(539, 439, 'straw2', 'frame0000').setScale(0.8);
            game.stablesManager.addSpriteAnims(straw2, 'straw2_pickup', [
                    'frame0000', 'frame0001', 'frame0002', 'frame0003', 'frame0004', 'frame0005', 'frame0006'
                ])
            game.stablesManager.addSpriteAnims(straw2, 'straw2_place', [
                    'frame0006', 'frame0007', 'frame0008', 'frame0009', 'frame0010', 'frame0011', 'frame0012'
                ])
            const straw2Interactive = game.add.graphics().setInteractive(new Phaser.Geom.Rectangle(419, 309, 170, 170), Phaser.Geom.Rectangle.Contains);
            straw2Interactive.on('pointerdown', function (pointer) {cleanStraw(straw2, 'straw2_pickup', 'straw2_place')});
        const straw1 = game.add.sprite(351, 420, 'straw1', 'frame0000').setScale(0.65);
            game.stablesManager.addSpriteAnims(straw1, 'straw1_pickup', [
                    'frame0000', 'frame0001', 'frame0002', 'frame0003', 'frame0004', 'frame0005', 'frame0006'
                ])
            game.stablesManager.addSpriteAnims(straw1, 'straw1_place', [
                    'frame0006', 'frame0007', 'frame0008', 'frame0009', 'frame0010', 'frame0011', 'frame0012'
                ])
            const straw1Interactive = game.add.graphics().setInteractive(new Phaser.Geom.Rectangle(249, 309, 170, 170), Phaser.Geom.Rectangle.Contains);
            straw1Interactive.on('pointerdown', function (pointer) {cleanStraw(straw1, 'straw1_pickup', 'straw1_place')});
        const straw3 = game.add.sprite(643, 411, 'straw3', 'frame0000').setScale(0.75);
            game.stablesManager.addSpriteAnims(straw3, 'straw3_pickup', [
                    'frame0000', 'frame0001', 'frame0002', 'frame0003', 'frame0004', 'frame0005', 'frame0006'
                ])
            game.stablesManager.addSpriteAnims(straw3, 'straw3_place', [
                    'frame0006', 'frame0007', 'frame0008', 'frame0009', 'frame0010', 'frame0011', 'frame0012'
                ])
            const straw3Interactive = game.add.graphics().setInteractive(new Phaser.Geom.Rectangle(589, 309, 170, 170), Phaser.Geom.Rectangle.Contains);
            straw3Interactive.on('pointerdown', function (pointer) {cleanStraw(straw3, 'straw3_pickup', 'straw3_place')});
        /**
         * Picks up dirty straw when shovel is used on dirty straw and places clean straw when a
         * full pitchfork is used on an empty section of floor.
         * @param {sprite} straw The sprite for the straw being interacted with.
         * @param {string} pickupAnim The name of the animation to play for picking up the straw.
         * @param {string} placeAnim The name of the animation to play for placing the straw.
         */
        function cleanStraw(straw, pickupAnim, placeAnim) {
            if (game.handCurrent === game.HAND.shovel && straw.frame.name === 'frame0000') {
                straw.play(pickupAnim);
                game.shovelSound.play();
                game.cursor.play('shovel_scoop');
                game.stablesManager.updateBar(game.cleanlinessBar, 1/3)
                game.stablesManager.updateBar(game.happinessBar, 1/6 + 0.05)
            }
            else if (game.handCurrent === game.HAND.forkFilled && straw.frame.name === 'frame0006') {
                straw.play(placeAnim);
                game.handCurrent = game.HAND.fork
                game.forkPlace.play()
                game.stablesManager.updateBar(game.cleanlinessBar, 1/3)
                game.stablesManager.updateBar(game.happinessBar, 1/6 + 0.05)
                if ((parseInt(straw1.frame.name.substr(7,2)) + parseInt(straw2.frame.name.substr(7,2)) + parseInt(straw3.frame.name.substr(7,2))) >= 30)  {
                    game.stablesManager.addToQueue(game.statBoxQueue, localeData.txtNoMoreHay)
                }
            }
            else if ((game.handCurrent === game.HAND.shovel || game.handCurrent === game.HAND.forkFilled) &&
                (parseInt(straw1.frame.name.substr(7,2)) + parseInt(straw2.frame.name.substr(7,2)) + parseInt(straw3.frame.name.substr(7,2))) <= 30) {
                if (game.handCurrent === game.HAND.shovel && (straw1.frame.name !== 'frame0000' && straw2.frame.name !== 'frame0000' && straw3.frame.name !== 'frame0000')) {return}
                else if (game.handCurrent === game.HAND.forkFilled && (straw1.frame.name !== 'frame0006' && straw2.frame.name !== 'frame0006' && straw3.frame.name !== 'frame0006')) {return}
                switch (straw) {
                    case straw1:
                        cleanStraw(straw3, 'straw3_pickup', 'straw3_place')
                        break;
                    case straw2:
                        cleanStraw(straw1, 'straw1_pickup', 'straw1_place')
                        break;
                    default:
                        cleanStraw(straw2, 'straw2_pickup', 'straw2_place')
                        break;
                }
            }
        }


        // Hay loft
        const hayLoft = game.add.sprite(350, 56, 'hay_loft', 'idle').setInteractive().setScale(.88);
            game.stablesManager.addSpriteAnims(hayLoft, 'get_hay', [
                    'idle', 'idle', 'idle', 'idle', 'idle', 'idle', 'idle', 'idle',
                    'shuffle0000', 'shuffle0001', 'shuffle0000',
                    'idle'
                ])
            hayLoft.on('pointerdown', function (pointer) {
                if (game.handCurrent === game.HAND.fork &&
                    (parseInt(straw1.frame.name.substr(7,2)) + parseInt(straw2.frame.name.substr(7,2)) + parseInt(straw3.frame.name.substr(7,2))) <= 30
                ) {
                    game.handCurrent = game.HAND.forkFilled
                    game.forkFill.play()
                    hayLoft.play('get_hay')
                }
            });


        // Awards
        if (horseName !== "ronnie") {
            game.awards = game.add.sprite(93, 165, 'awards', 'idle').setInteractive({ pixelPerfect: true });
        }
            // TODO: Enable this once the awards page has been added
            // game.awards.on('pointerover', function (pointer){ game.stablesManager.pointerover(game.awards, game.hover1) } )
            // game.awards.on('pointerout', function (pointer){ game.stablesManager.pointerout(game.awards) } )
            // game.awards.on('pointerdown', function (pointer){ window.location.href = game.awardsLink } )


        // Water Trough
        game.trough = game.add.sprite(153, 455, 'trough', 'idle').setInteractive({ pixelPerfect: true });
            game.stablesManager.addSpriteAnims(game.trough, 'fill_water', [
                    'water0011', 'water0011', 'water0011',
                    'water0014', 'water0014',
                    'water0016', 'water0016',
                    'water0018', 'water0019', 'water0020', 'water0021', 'water0022', 'water0023', 'water0024', 'water0025', 'water0025',
                    'water0027', 'water0028', 'water0029', 'water0030', 'water0031', 'water0032', 'water0033', 'water0034', 'water0035',
                    'water0036', 'water0037', 'water0038', 'water0039', 'water0040', 'water0041', 'water0042', 'water0043', 'water0044',
                    'water0045', 'water0046', 'water0047', 'water0048', 'water0049', 'water0050', 'water0051', 'water0052', 'water0053',
                    'water0054', 'water0055', 'water0056', 'water0057', 'water0058', 'water0059', 'water0060'
                ])
            game.stablesManager.addSpriteAnims(game.trough, 'water_trough_drink', [
                    'water0060', 'water0060', 'water0060',
                    'water0060', 'water0060', 'water0060', 'water0060', 'water0060', 'water0060', 'water0060', 'water0060', 'water0060', 'water0060',
                    'water0092', 'water0093', 'water0094', 'water0095', 'water0096', 'water0097', 'water0098', 'water0099', 'water0100',
                    'water0101', 'water0102', 'water0103', 'water0104', 'water0105', 'water0106', 'water0107', 'water0108', 'water0109', 'water0110',
                    'water0111', 'water0112', 'water0113', 'water0114', 'water0115', 'water0116', 'water0117', 'water0118', 'water0119', 'water0120',
                    'water0121', 'water0121', 'water0122', 'water0123', 'water0124', 'water0125', 'water0126'
                ])
            game.trough.on('pointerdown', function (pointer)
            {
                if (!game.waterFilled && game.handCurrent === game.HAND.empty) {
                    game.waterFilled = true;
                    game.trough.play('fill_water');
                    game.troughMask.play('mask_fill_water');
                    game.waterSound.play()
                    game.stablesManager.addToQueue(game.horseAnimationQueue, game.HORSE_STATES.drink)
                }
            });
            game.trough.on('pointerover', function (pointer) {
                if (!game.waterFilled && game.handCurrent === game.HAND.empty) {
                    game.trough.setFrame('hover');
                    game.hover1.play();
                }
            });
            game.trough.on('pointerout', function (pointer) {
                if (!game.waterFilled && game.handCurrent === game.HAND.empty) {
                    game.trough.setFrame('idle');
                }
            });

        // Food Trough
        if (horseData.height === 'short') {
            game.foodTrough = game.add.sprite(142, 258, 'food_trough_small', 0).setInteractive({ pixelPerfect: true });
        } else {
            game.foodTrough = game.add.sprite(104, 303, 'food_trough', 0).setInteractive({ pixelPerfect: true });
        }
        
            game.stablesManager.addSpriteAnims(game.foodTrough, 'fill', [
                    'empty',
                    'fill0000', 'fill0001', 'fill0002', 'fill0003', 'fill0004', 'fill0005', 'fill0006', 'fill0007', 'fill0008', 'fill0009', 'fill0010',
                    'full'
                ])
            game.stablesManager.addSpriteAnims(game.foodTrough, 'fill_again', [
                    'full',
                    'fill_again0000', 'fill_again0001', 'fill_again0002', 'fill_again0003', 'fill_again0004', 'fill_again0004', 'fill_again0004', 'fill_again0004', 'fill_again0004', 'fill_again0009', 'fill_again0010',
                    'full'
                ])
            game.foodTrough.on('pointerdown', function (pointer)
            {
                if (game.handCurrent === game.HAND.grainScoop) {
                    game.handCurrent = game.HAND.empty;
                    grainBin.play('grain_place');
                    game.foodTrough.play(game.foodTrough.frame.name !== 'empty' ? 'fill_again' : 'fill')
                    game.grainSound.play()
                    game.stablesManager.addToQueue(game.horseAnimationQueue, game.HORSE_STATES.eatingFood)
                }
            });


        // Horse hit box
        if (horseData.height === 'short') {
            //TODO: still need to size this
            game.stablesManager.createHorseHitbox(230, 180, 267, 192, () => {}, -30, 0)
        } else {
            game.stablesManager.createHorseHitbox(230, 100, 356, 256)
        }


        // Inspirational message frame
        const frame = game.add.sprite(516, 118, 'frame', 'idle').setScale(.93);
        if (isDressup) {
            game.horsePic = game.add.spine(518, 125, 'horsePicJson', `horsePicAtlas`).setScale(.35);
        } else {
            game.add.image(517, 126, 'horse_image').setScale(.32);
        }
        const frameInteractive = game.add.graphics().setInteractive(new Phaser.Geom.Rectangle(478, 65, 75, 110), Phaser.Geom.Rectangle.Contains);
            frameInteractive.on('pointerover', function (pointer) {
                if (game.canPlayInspiration) {
                    frame.setFrame('hover');
                    game.inspirationHover.play()
                }
            });
            frameInteractive.on('pointerout', function (pointer) { frame.setFrame('idle') });
            frameInteractive.on('pointerdown', function (pointer) { 
                if (game.canPlayInspiration) {
                    game.playInspiration = true 
                    game.inspirationSound.play()
                }
            })


        // Horse
        if (horseData.height === 'short') {
            game.stablesManager.createHorse(398, 330, 90, .75)
        } else {
            game.stablesManager.createHorse(418, 295, 90)
        }


        // Pitchfork
        const fork = game.add.sprite(718, 177, 'fork', 'idle').setDepth(1).setInteractive(
                new Phaser.Geom.Polygon('212 363 172 363 212 133 267 133'), Phaser.Geom.Polygon.Contains);
            const forkText = game.add.text(643, 225, 'Static Text Object', game.stablesManager.hoverTextSettingsMain).setAlpha(0).setOrigin(0.5).setDepth(1);
                forkText.text = localeData.txtPitchForkHilite2;
            game.stablesManager.addSpriteAnims(fork, 'fork_fill', [
                    'fill0000', 'fill0001', 'fill0002', 'fill0003', 'fill0004', 'fill0005', 'fill0006', 'fill0007', 'held_filled'
                ])
            game.stablesManager.addSpriteAnims(fork, 'fork_pickup', [
                    'hold0000', 'hold0001', 'hold0002', 'hold0003', 'hold0004', 'hold0005', 'hold0006', 'hold0007', 'held_empty'
                ])
            game.stablesManager.addSpriteAnims(fork, 'fork_place', [
                    'place0000', 'place0001', 'place0002', 'place0003', 'place0004', 'place0005', 'held_empty'
                ])
            fork.on('pointerover', function (pointer)
            {
                if (game.handCurrent === game.HAND.empty) {
                    if (straw1.frame.name !== 'frame0000' || straw2.frame.name !== 'frame0000' || straw3.frame.name !== 'frame0000') {
                        fork.setFrame('hover_use');
                        forkText.text = localeData.txtRollOverPitchFork;
                    }
                    else {
                        fork.setFrame('hover_wait');
                        forkText.text = localeData.txtPitchForkHilite2;
                    }
                    forkText.setAlpha(1)
                    game.hover2.play();
                }
            });
            fork.on('pointerout', function (pointer) { game.stablesManager.pointerout(fork, forkText) });
            fork.on('pointerdown', function (pointer)
            {
                if (game.handCurrent === game.HAND.empty && (straw1.frame.name !== 'frame0000' || straw2.frame.name !== 'frame0000' || straw3.frame.name !== 'frame0000')) {
                    game.handCurrent = game.HAND.fork;
                    fork.setFrame('in_use')
                    forkText.setAlpha(0)
                    game.pickup.play();
                }
                else if (game.handCurrent === game.HAND.fork || game.handCurrent === game.HAND.forkFilled) {
                    game.handCurrent = game.HAND.empty;
                    fork.setFrame('idle')
                    forkText.setAlpha(0)
                }
            });
            

        // Shovel
        const shovel = game.add.sprite(742, 189, 'shovel', 'idle').setDepth(1).setInteractive(
                new Phaser.Geom.Polygon('220 410 170 380 215 175 260 175'), Phaser.Geom.Polygon.Contains);
            const shovelText = game.add.text(685, 270, 'Static Text Object', game.stablesManager.hoverTextSettingsMain).setAlpha(0).setOrigin(.5, .5).setDepth(1);
                shovelText.text = localeData.txtShovelHilite2;
            game.stablesManager.addSpriteAnims(shovel, 'shovel_pickup', [
                    'hold0000', 'hold0001', 'held'
                ])
            game.stablesManager.addSpriteAnims(shovel, 'shovel_scoop', [
                    'held',
                    'scoop0000', 'scoop0001', 'scoop0002', 'scoop0003', 'scoop0004', 'scoop0005', 'scoop0006', 'scoop0007', 'scoop0008', 'scoop0009',
                    'scoop0010', 'scoop0011', 'scoop0012',
                    'held'
                ])
            shovel.on('pointerover', function (pointer)
            {
                if (game.handCurrent === game.HAND.empty) {
                    if (straw1.frame.name !== 'frame0000' && straw2.frame.name !== 'frame0000' && straw3.frame.name !== 'frame0000') {
                        shovel.setFrame('hover_done');
                        shovelText.text = localeData.txtShovelHilite2;
                        shovelText.setAlpha(1)
                    }
                    else {
                        shovel.setFrame('hover_use');
                        shovelText.text = localeData.txtRollOverShovel;
                        shovelText.setAlpha(1)
                    }
                    game.hover2.play();
                }
            });
            shovel.on('pointerout', function (pointer) { game.stablesManager.pointerout (shovel, shovelText) });
            shovel.on('pointerdown', function (pointer) {
                if (game.handCurrent === game.HAND.empty && (straw1.frame.name === 'frame0000' || straw2.frame.name === 'frame0000' || straw3.frame.name === 'frame0000')) {
                    game.handCurrent = game.HAND.shovel;
                    shovel.setFrame('in_use')
                    shovelText.setAlpha(0)
                    game.pickup.play();
                }
                else if (game.handCurrent === game.HAND.shovel) {
                    game.handCurrent = game.HAND.empty;
                    shovel.setFrame('idle')
                    shovelText.setAlpha(0)
                }
            });


        // Brush
        const brush = game.add.sprite(767, 100, 'brush', 'idle').setScale(0.75).setDepth(1);
        const brushInteractive = game.add.graphics().setInteractive(new Phaser.Geom.Rectangle(753, 88, 40, 50), Phaser.Geom.Rectangle.Contains);
            game.stablesManager.addSpriteAnims(brush, 'brush_pickup', [
                    'pickup0000', 'pickup0001', 'pickup0002', 'pickup0003', 'pickup0004', 'pickup0005',
                    'in_use'
                ])
            game.stablesManager.addSpriteAnims(brush, 'brush_use', [
                    'hold',
                    'brush0000', 'brush0001', 'brush0002', 'brush0003', 'brush0004', 'brush0005', 'brush0006', 'brush0007', 'brush0008', 'brush0009',
                    'hold'
                ])
            game.stablesManager.addSpriteAnims(brush, 'brush_place', [
                    'place0000', 'place0001', 'place0002', 'place0003', 'place0004', 'place0005', 'place0006'
                ])
            brushInteractive.on('pointerdown', function (pointer) { game.stablesManager.pointerdown(brush, game.HAND.brush, 'brush_pickup', 'brush_place') });
            brushInteractive.on('pointerover', function (pointer) { game.stablesManager.pointerover (brush, game.hover1) });
            brushInteractive.on('pointerout', function (pointer) { game.stablesManager.pointerout (brush) });

        // Small Brush
        const brushSmall = game.add.sprite(746, 64, 'brush_small', 'idle').setDepth(1);
        const brushSmallInteractive = game.add.graphics().setInteractive(new Phaser.Geom.Rectangle(753, 54, 40, 28), Phaser.Geom.Rectangle.Contains);
            game.stablesManager.addSpriteAnims(brushSmall, 'brush_pickup_small', [
                    'pickup0000', 'pickup0001', 'pickup0002', 'pickup0003', 'pickup0004', 'pickup0005',
                    'in_use'
                ])
            game.stablesManager.addSpriteAnims(brushSmall, 'brush_use_small', [
                    'hold',
                    'brush0000', 'brush0001', 'brush0002', 'brush0003', 'brush0004', 'brush0005', 'brush0006', 'brush0007', 'brush0008', 'brush0009', 'brush0010',
                    'hold'
                ])
            game.stablesManager.addSpriteAnims(brushSmall, 'brush_place_small', [
                    'place0000', 'place0001', 'place0002', 'place0003', 'place0004', 'place0005',
                    'idle'
                ])
            brushSmallInteractive.on('pointerdown', function (pointer) { game.stablesManager.pointerdown(brushSmall, game.HAND.brushSmall, 'brush_pickup_small', 'brush_place_small') });
            brushSmallInteractive.on('pointerover', function (pointer) { game.stablesManager.pointerover (brushSmall, game.hover1) });
            brushSmallInteractive.on('pointerout', function (pointer) { game.stablesManager.pointerout (brushSmall) });

        // Hoofpick
        const hoofpick = game.add.sprite(823, 80, 'hoofpick', 'idle').setScale(0.75).setDepth(1);
        const hoofpickInteractive = game.add.graphics().setInteractive(new Phaser.Geom.Rectangle(801, 60, 26, 75), Phaser.Geom.Rectangle.Contains);
            game.stablesManager.addSpriteAnims(hoofpick, 'hoofpick_pickup', [
                    'pickup0000', 'pickup0001', 'pickup0002', 'pickup0003', 'pickup0004', 'pickup0005', 'in_use'
                ])
            game.stablesManager.addSpriteAnims(hoofpick, 'hoofpick_use', [
                    'use0000', 'use0001', 'use0002', 'use0003', 'use0004', 'use0005', 'use0006', 'use0007', 'use0008', 'use0009',
                    'use0010', 'use0011', 'use0012', 'use0012',
                    'hold'
                ])
            game.stablesManager.addSpriteAnims(hoofpick, 'hoofpick_place', ['idle'])
            hoofpickInteractive.on('pointerdown', function (pointer) { 
                game.stablesManager.pointerdown(hoofpick, game.HAND.hoofpick, 'hoofpick_pickup', 'hoofpick_place') 
                hooves1.setVisible(game.handCurrent === game.HAND.hoofpick)
                hooves2.setVisible(game.handCurrent === game.HAND.hoofpick)
            });
            hoofpickInteractive.on('pointerover', function (pointer) { game.stablesManager.pointerover (hoofpick, game.hover1) });
            hoofpickInteractive.on('pointerout', function (pointer) { game.stablesManager.pointerout (hoofpick)});
        // Hoof highlight circles
        let hooves1
        let hooves2
        if (horseData.height === 'short') {
            hooves1 = game.add.sprite(323, 442, 'hooves', 0).setInteractive().setScale(.84).setVisible(false).setDepth(1);
            hooves2 = game.add.sprite(485, 438, 'hooves', 0).setInteractive().setScale(.84).setVisible(false).setDepth(1);
        } else {
            hooves1 = game.add.sprite(316, 445, 'hooves', 0).setInteractive().setScale(.84).setVisible(false).setDepth(1);
            hooves2 = game.add.sprite(531, 445, 'hooves', 0).setInteractive().setScale(.84).setVisible(false).setDepth(1);
        }
        game.additionalCleanCondition = () => {return hooves1.frame.name === 2 && hooves2.frame.name === 2}
            /**
             * Updates the hoofpick highlight circle to show the next stage, plays the hoofpick use animation
             * and updates the horse stat bars if the hooves (at the highlight sprite) need to be cleaned.
             * @param {sprite} sprite The hoof highlight sprite being interacted with
             */
            function cleanHooves(sprite) {
                if (sprite.frame.name <2 && game.handCurrent === game.HAND.hoofpick) {
                    sprite.setFrame(sprite.frame.name + 1)
                    if (sprite.frame.name === 2) {
                        if (sprite === hooves1) {
                            game.stablesManager.addToQueue(game.statBoxQueue, localeData.txtFrontHooves)
                        } else {
                            game.stablesManager.addToQueue(game.statBoxQueue, localeData.txtRearHooves)
                        }
                    }
                    game.stablesManager.checkClean()
                    game.cursor.play('hoofpick_use')
                    game.time.delayedCall(80, function () {game.hoofpick1.play()});
                    game.time.delayedCall(380, function () {game.hoofpick2.play()});
                    game.stablesManager.updateBar(game.cleanlinessBar, 0.25)
                    game.stablesManager.updateBar(game.happinessBar, 1/8)
                }
            }
            hooves1.on('pointerdown', function (pointer) { cleanHooves(hooves1) });
            hooves2.on('pointerdown', function (pointer) { cleanHooves(hooves2) });


        // Apple Bin
        const appleBin = game.add.sprite(680, 505, 'appleBin', 'idle').setInteractive().setDepth(1);
            game.stablesManager.addSpriteAnims(appleBin, 'takeApple', ['idle'])
            appleBin.on('pointerover', function (pointer) { game.stablesManager.pointerover (appleBin, game.hover1) });
            appleBin.on('pointerout', function (pointer) { appleBin.setFrame('idle') });
            appleBin.on('pointerdown', function (pointer) { game.stablesManager.pointerdown(appleBin, game.HAND.apple, 'takeApple', 'takeApple') });
        

        // Grain Bin
        const grainBin = game.add.sprite(736, 413, 'grain_bin', 'idle').setInteractive({ pixelPerfect: true }).setDepth(1);
        const grainText = game.add.text(610, 325, 'Static Text Object', game.stablesManager.hoverTextSettingsMain).setAlpha(0).setDepth(1);
            grainText.text = localeData.txtOatsRollOver;
            game.stablesManager.addSpriteAnims(grainBin, 'gain_pickup', [
                    'idle',
                    'pickup0000', 'pickup0001', 'pickup0002', 'pickup0003', 'pickup0004', 'pickup0005', 'pickup0006', 'pickup0007', 'pickup0008', 'pickup0009', 'pickup0010',
                    'pickup0011', 'pickup0012', 'pickup0013', 'pickup0013', 'pickup0015', 'pickup0016', 'pickup0017',
                    'empty'
                ])
            game.stablesManager.addSpriteAnims(grainBin, 'grain_place', [
                    'empty',
                    'place0000', 'place0001', 'place0002', 'place0003', 'place0004', 'place0005', 'place0006', 'place0007',
                    'idle'
                ])
            grainBin.on('pointerover', function (pointer) { game.stablesManager.pointerover (grainBin, game.hover2, grainText) });
            grainBin.on('pointerout', function (pointer) {
                if (game.handCurrent === game.HAND.grainScoop) {
                    grainBin.setFrame('empty')
                    grainText.setAlpha(0)
                } else {
                    grainBin.setFrame('idle')
                    grainText.setAlpha(0)
                }
            });
            grainBin.on('pointerdown', function (pointer) {
                if (game.handCurrent === game.HAND.empty) {
                    game.handCurrent = game.HAND.grainScoop
                    grainText.setAlpha(0)
                    grainBin.play('gain_pickup')
                    game.pickup.play();
                    game.grainSound.play()
                } else if (game.handCurrent === game.HAND.grainScoop) {
                    game.handCurrent = game.HAND.empty;
                }
            });

        
        game.troughMask = game.add.sprite(153, 455, 'trough_mask', 'water0000').setVisible(false).setDepth(1);
            game.stablesManager.addSpriteAnims(game.troughMask, 'mask_fill_water', [
                    'water0011', 'water0011', 'water0011',
                    'water0014', 'water0014',
                    'water0016', 'water0016',
                    'water0018', 'water0019', 'water0020', 'water0021', 'water0022', 'water0023', 'water0024', 'water0025', 'water0025',
                    'water0027', 'water0028', 'water0029', 'water0030', 'water0031', 'water0032', 'water0033', 'water0034', 'water0035',
                    'water0036', 'water0037', 'water0038', 'water0039', 'water0040', 'water0041', 'water0042', 'water0043', 'water0044',
                    'water0045', 'water0046', 'water0047', 'water0048', 'water0049', 'water0050', 'water0051', 'water0052', 'water0053',
                    'water0054', 'water0055', 'water0056', 'water0057', 'water0058', 'water0059', 'water0060'
                ])
            game.stablesManager.addSpriteAnims(game.troughMask, 'mask_water_trough_drink', [
                    'water0060', 'water0060', 'water0060',
                    'water0060', 'water0060', 'water0060', 'water0060', 'water0060', 'water0060', 'water0060', 'water0060', 'water0060', 'water0060',
                    'water0092', 'water0093', 'water0094', 'water0095', 'water0096', 'water0097', 'water0098', 'water0099', 'water0100',
                    'water0101', 'water0102', 'water0103', 'water0104', 'water0105', 'water0106', 'water0107', 'water0108', 'water0109', 'water0110',
                    'water0111', 'water0112', 'water0113', 'water0114', 'water0115', 'water0116', 'water0117', 'water0118', 'water0119', 'water0120',
                    'water0121', 'water0121', 'water0122', 'water0123', 'water0124', 'water0125', 'water0126'
                ])


        // Lucky Horseshoe
        const luck = game.add.sprite(453, 268, 'luck', 'idle').setDepth(1);
        const luckHitbox = game.stablesManager.addHitbox(614, 25, 40, 40);
            game.stablesManager.addSpriteAnims(luck, 'good_luck', [
                    'idle',
                    'good_luck0000', 'good_luck0001', 'good_luck0002', 'good_luck0003', 'good_luck0004', 'good_luck0005', 'good_luck0006', 'good_luck0007', 'good_luck0008', 'good_luck0009',
                    'good_luck0010', 'good_luck0011', 'good_luck0012', 'good_luck0013', 'good_luck0014', 'good_luck0015', 'good_luck0016', 'good_luck0017', 'good_luck0018', 'good_luck0019',
                    'good_luck0020', 'good_luck0021', 'good_luck0022', 'good_luck0023', 'good_luck0024', 'good_luck0025', 'good_luck0026', 'good_luck0027', 'good_luck0028', 'good_luck0029',
                    'good_luck0030', 'good_luck0031', 'good_luck0032', 'good_luck0033', 'good_luck0034', 'good_luck0035', 'good_luck0036', 'good_luck0037', 'good_luck0038', 'good_luck0039',
                    'good_luck0040', 'good_luck0041', 'good_luck0042',
                    'idle'
                ])
            luckHitbox.on('pointerdown', function (pointer) {
                if (luck.frame.name === 'hover') {
                    luck.play('good_luck')
                    game.luckSound.play()
                }
            });
            luckHitbox.on('pointerover', function (pointer) {
                if (luck.frame.name === 'idle') {
                    luck.setFrame('hover')
                    game.hover1.play();
                }
            });
            luckHitbox.on('pointerout', function (pointer) {
                if (luck.frame.name === 'hover') {
                    luck.setFrame('idle')
                }
            });

        // ---------- Stable foreground and UI ---------- //
        game.stablesManager.createStatBox(625, 130)
        game.stablesManager.createBeSaWorldLink(625, 130, .8, .7, "Main")
        game.stablesManager.createUI([
            [115, 85, localeData.txtHelpTrophyRoom, "Small"],
            [103, 300, localeData.txtHelpWater, "Small"],
            [315, 400, localeData.txtHelpStats, "OneLine"],
            [400, 200, localeData.txtHelpPitchFork, "Big"],
            [427, 115, localeData.txtHelpInspiration, "Small"],
            [515, 270, localeData.txtHelpShovel, "Big"],
            [537, 410, localeData.txtHelpApple, "Med"],
            [535, 345, localeData.txtHelpOats, "Med"],
            // [792, 243, localeData.txtHelpBottle, "Small"],
            [490, 63, localeData.txtHelpWorld, "OneLine"],
            [755, 33, localeData.txtHelpHoofPick, "Big"],
            [670, 107, localeData.txtHelpBrush, "Small"],
            [507, 23, localeData.txtHelpLuck, "OneLine"]
        ])
    }

    update () {
        const game = this
        game.stablesManager.updateCursor({})


        if (game.horseBusy === false && game.horseAnimationQueue.length > 0) {
            const animation = game.horseAnimationQueue.shift()
            game.horseBusy = true

            if (animation === game.HORSE_STATES.rear) {
                game.rearSound.play();
                game.stablesManager.horsePlayAnimation('rear')
            } 
            else if (animation === game.HORSE_STATES.drink) {
                game.time.delayedCall(2800, function () {
                    game.troughMask.setVisible(true)
                    game.trough.play('water_trough_drink')
                    game.troughMask.play('mask_water_trough_drink')
                    game.stablesManager.horsePlayAnimation('drink')
                });
                game.time.delayedCall(3330, function () {
                    game.waterDrink.play()
                });
                game.time.delayedCall(5500, function () {
                    game.troughMask.setVisible(false)
                });
            }
            else if (animation === game.HORSE_STATES.eatingFood) {
                game.time.delayedCall(800, function () { game.stablesManager.horsePlayAnimation('eat_food') });
                game.time.delayedCall(1000, function () { game.oatsEat.play() });
            }
            else if (animation === game.HORSE_STATES.eatingApple) {
                game.appleMunch.play();
                game.stablesManager.horsePlayAnimation('eat_apple')
            }
        }

        game.stablesManager.updateInspirationalMessage()
        game.stablesManager.updateStatbox()

    }
}