// TODO : Need to handle the loading
// At startup and between scenes

class Common_Load extends Phaser.Scene 
{
    ZONES_ARRAY = [
        "R001",
        "R010",
        "R011",
        "R050",
        "Z001",
        "Z002",
        "Z003",
        "Z004",
        "Z005",
        "Z006",
        "Z007",
        "Z008",
        "Z009",
        "Z010",
        "Z011",
        "Z012",
        "Z013",
        "Z015",
        "Z016",
        "Z022",
        "Z023",
        "Z025",
        "Z026",
        "Z027",
        "Z028",
        "Debug"
    ]

    constructor ()
    {
        super({ key: 'common_load' });
    }

    init (sharedData) {
        // Used to preload certain data for the zone
        this.sharedData = sharedData

        if (this.sharedData.zone === undefined) {
            this.sharedData.zone = {}
        }
        if (this.sharedData.zone.data === undefined) {
            this.sharedData.zone.data = {}
            this.sharedData.zone.data.ZONES_ARRAY = this.ZONES_ARRAY
            this.sharedData.zone.data.tiles = {}
        }

        if (this.sharedData.quest === undefined) {
            this.sharedData.quest = {}
        }

        if (this.sharedData.template === undefined) {
            this.sharedData.template = {}
        }

        if (this.sharedData.entities === undefined) {
            this.sharedData.entities = {}
            this.sharedData.entities.spawnedEntities = {}
            const timeTrackedEntities = loadData(DATA_TYPES.game, GAME_ID.Adventures)["entityTime"]
            if (timeTrackedEntities) {
                this.sharedData.entities.timeTrackedEntities = timeTrackedEntities
            } else {
                this.sharedData.entities.timeTrackedEntities = {}
            }
        }

        if (this.sharedData.global === undefined) {
            this.sharedData.global = {}
        }
        if (this.sharedData.global.currentZone === undefined) {
            this.sharedData.global.currentZone = "Z001"
        }
        if (this.sharedData.global.stillImageEntities === undefined) {
            this.sharedData.global.stillImageEntities = new Set([])
        }
        this.sharedData.global.uiOpen = false

        if (this.sharedData.ui === undefined) {
            this.sharedData.ui = {}
        }
    }

    preload ()
    {
        loadLoadingUI(this);
        this.saveManager = new SaveManager(this);
        this.questManager = new QuestManager(this);
        this.templateManager = new TemplateManager(this);
        this.inventory = new InventoryManager(this);
        this.zoneManager = new ZoneManager(this);

        this.load.json("ZoneConfig", `${ZONE_XML_PATH}zoneConfig.json`);

        // Loading xml for all zones so we can use it to find entity locations
        this.ZONES_ARRAY.forEach(zone => {
            this.load.xml(`${zone}Tiles`, `${ZONE_XML_PATH}${zone}.xml`);
        });

        this.load.xml("SharedUI", `${UI_XML_PATH}shared.xml`);
        this.load.json("QuestConfig", `${COMMON_XML_PATH}questConfig.json`);
        this.load.json("NPCConfig", `${COMMON_XML_PATH}npcConfig.json`);

        debug.loadScene = this
    }

    create (sharedData)
    {
        const loader = this
        loader.sharedData = sharedData

        loader.sharedData.ui.localization = parseSharedXML(this.cache.xml.get("SharedUI"))

        if (loader.sharedData.zone.config === undefined) {
            loader.sharedData.zone.config = this.cache.json.get("ZoneConfig")
        }

        if (loader.sharedData.zone.data.tiles[loader.sharedData.global.currentZone] === undefined) {
            // Loading xml for all zones so we can use it to find entity locations
            loader.sharedData.zone.data.tiles = {}
            this.ZONES_ARRAY.forEach(zone => {
                this.sharedData.zone.data.tiles[zone] = this.cache.xml.get(`${zone}Tiles`)
            });
        }

        // Load NPC base setup
        if (loader.sharedData.entities.spawnConfig === undefined) {
            loader.sharedData.entities.spawnConfig = this.cache.json.get("NPCConfig");
        }

        // Load quest data
        if (loader.sharedData.quest.config === undefined) {
            loader.sharedData.quest.config = this.cache.json.get("QuestConfig")
        }
        if (loader.sharedData.quest.manager === undefined) {
            loader.sharedData.quest.manager = loader.questManager
            loader.sharedData.quest.manager.initializeQuestData()
        }
        this.templateManager.create()

        if (loader.sharedData.zone.manager === undefined){
            loader.sharedData.zone.manager = loader.zoneManager;
            loader.sharedData.zone.manager.initializeData();
        }

        
        let data = this.sharedData.saving.getGameData(GAME_DATA_TYPE.player);
        if (!data || !data.zone) {
            this.sharedData.global.currentZone = "Z001"
        }
        else {
            this.sharedData.global.currentZone = data.zone;
        }        

        // TESTING
        this.scene.launch("common_ui", loader.sharedData)
                    .stop();


        this.scene.stop("common_zone")
        this.scene.launch("common_zone", loader.sharedData);
    }
}
