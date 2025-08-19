// script.js

document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connectButton');
    const disconnectButton = document.getElementById('disconnectButton');
    const turnOffButton = document.getElementById('turnOffButton');
    const statusDisplay = document.getElementById('status');
    const pantsDisplay = document.getElementById('pants');
    const tileDisplay = document.getElementById('tile');
    const accXDisplay = document.getElementById('accX');
    const accYDisplay = document.getElementById('accY');
    const accZDisplay = document.getElementById('accZ');
    const logDisplay = document.getElementById('log');

    let legoMario;
    let legoCharacteristic;

    const LEGO_SERVICE_UUID = '00001623-1212-efde-1623-785feabcd123';
    const LEGO_CHARACTERISTIC_UUID = '00001624-1212-efde-1623-785feabcd123';

    const HEX_TO_COLOR_TILE = {
        0x0c: "Purple", 0x13: "White", 0x15: "Red", 0x17: "Blue",
        0x18: "Yellow", 0x1a: "Black", 0x25: "Green", 0x38: "Nougat Brown",
        0x42: "Cyan", 0x6a: "Brown"
    };

    const HEX_TO_PANTS = {
        0x00: "None", 0x03: "Bee", 0x05: "Luigi", 0x06: "Frog",
        0x0a: "Tanooki", 0x0c: "Propeller", 0x11: "Cat", 0x12: "Fire",
        0x14: "Penguin", 0x18: "Peach", 0x21: "Mario", 0x22: "Builder"
    };

    const HEX_TO_RGB_TILE = {
        33619967: "Goomba", 50397183: "Unknown", 67174399: "Whomp", 83951615: "Unknown",
        184614911: "Lego NES", 218169343: "Thwimp", 234946559: "Bob-omb", 251723775: "Unknown",
        268500991: "Unknown", 302055423: "Unknown", 318832639: "Unknown", 335609855: "Rotation",
        352387071: "Time Block", 385941503: "Unknown", 402718719: "Unknown", 419495935: "Unknown",
        436273151: "Unknown", 469827583: "Unknown", 486604799: "Bowser", 503382015: "Unknown",
        536936447: "Toadette", 553713663: "Treasure #1", 570490879: "Unknown", 587268095: "Poison Mushroom",
        687931391: "?-Block", 721485823: "Treasure #2", 738263039: "Bridge Slide", 755040255: "Unknown",
        771817471: "Cloud", 805371903: "Beetle", 822149119: "Moving Platform", 838926335: "Unknown",
        855703551: "Unknown", 889257983: "Lava Bubble", 906035199: "Unknown", 922812415: "Thwomp",
        939589631: "Unknown", 973144063: "Unknown", 989921279: "Unknown", 1006698495: "Toad",
        1526792191: "POW", 1560346623: "Unknown", 1577123839: "Unknown", 1593901055: "P-Switch",
        1610678271: "Boom Boom", 1644232703: "Unknown", 1661009919: "Super Mushroom", 1677787135: "Unknown",
        1778450431: "Peach's Castle", 1795227647: "Stone Eye", 1828782079: "Unknown", 1845559295: "Pokey",
        1862336511: "Sliding Platform", 1879113727: "Unknown", 1912668159: "Unknown", 1929445375: "Unknown",
        1946222591: "Unknown", 1962999807: "Unknown", 1996554239: "Unknown", 2013331455: "Unknown",
        2030108671: "Unknown", 2063663103: "Star", 2080440319: "Unknown", 2097217535: "Unknown",
        2113994751: "Piranha Plant", 2147549183: "Trasure #3", 2164326399: "Peeper", 2181103615: "Unknown",
        2281766911: "King Boo", 2298544127: "Cheep Cheep", 2332098559: "Baby Penguin", 2348875775: "Unknown",
        2365652991: "Unknown", 2382430207: "Unknown", 2415984639: "Unknown", 2432761855: "Wrench",
        2449539071: "Amp", 2466316287: "Unknown", 2499870719: "Unknown", 2516647935: "Unknown",
        2533425151: "Unknown", 2566979583: "BJR", 2583756799: "Unknown", 2600534015: "Unknown",
        2617311231: "Unknown", 2650865663: "Unknown", 2667642879: "Pink Yoshi", 2684420095: "Gear",
        2785083391: "Unknown", 2801860607: "Unknown", 2835415039: "Unknown", 2852192255: "Unknown",
        2868969471: "Seesaw", 2885746687: "Unknown", 2919301119: "Boo", 2936078335: "Start - Luigi",
        2952855551: "Unknown", 2969632767: "Unknown", 3003187199: "Unknown", 3019964415: "Unknown",
        3036741631: "Unknown", 3070296063: "Flag", 3087073279: "Start - Mario", 3103850495: "Unknown",
        3120627711: "Unknown", 3154182143: "Unknown", 3170959359: "Unknown", 3187736575: "Unknown",
        3288399871: "Unknown", 3305177087: "Unknown", 3338731519: "Unknown", 3355508735: "Unknown",
        3372285951: "Unknown", 3389063167: "Unknown", 3422617599: "Unknown", 3439394815: "Unknown",
        3456172031: "Unknown", 3472949247: "Unknown", 3506503679: "Unknown", 3523280895: "Unknown",
        4060151807: "Bully", 4093706239: "Coin Coffer", 1258422271: "Lemmy", 1291976703: "Start - Peach",
        906100735: "Present", 1140981759: "Red Fruit", 788660223: "Swing", 1023541247: "Nabbit",
        1409417215: "Hammer Bro", 1677852671: "Birdo", 1577189375: "The Mighty Bowser"
    };

    const SUBSCRIBE_IMU_COMMAND = new Uint8Array([0x0A, 0x00, 0x41, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x01]);
    const SUBSCRIBE_RGB_COMMAND = new Uint8Array([0x0A, 0x00, 0x41, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01]);
    const SUBSCRIBE_PANTS_COMMAND = new Uint8Array([0x0A, 0x00, 0x41, 0x02, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01]);
    const TURN_OFF_COMMAND = new Uint8Array([0x04, 0x00, 0x02, 0x01]);
    const DISCONNECT_COMMAND = new Uint8Array([0x04, 0x00, 0x02, 0x02]);

    function log(message) {
        console.log(message);
        logDisplay.textContent += message + '\n';
        logDisplay.scrollTop = logDisplay.scrollHeight;
    }

    function signed(char) {
        return char > 127 ? char - 256 : char;
    }

    connectButton.addEventListener('click', async () => {
        try {
            log('Requesting Bluetooth Device...');
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [LEGO_SERVICE_UUID] }],
                optionalServices: [LEGO_SERVICE_UUID]
            });

            log('Connecting to GATT Server...');
            const server = await device.gatt.connect();
            legoMario = device;

            log('Getting Service...');
            const service = await server.getPrimaryService(LEGO_SERVICE_UUID);

            log('Getting Characteristic...');
            const characteristic = await service.getCharacteristic(LEGO_CHARACTERISTIC_UUID);
            legoCharacteristic = characteristic;

            log('Starting Notifications...');
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', handleNotifications);

            log('Subscribing to sensors...');
            const requestQueue = [
                () => characteristic.writeValueWithResponse(SUBSCRIBE_IMU_COMMAND),
                () => characteristic.writeValueWithResponse(SUBSCRIBE_RGB_COMMAND),
                () => characteristic.writeValueWithResponse(SUBSCRIBE_PANTS_COMMAND),
            ];

            for (const request of requestQueue) {
                await request();
                await new Promise(resolve => setTimeout(resolve, 250));
            }

            log('Connected!');
            statusDisplay.textContent = 'Connected';
            connectButton.disabled = true;
            disconnectButton.disabled = false;
            turnOffButton.disabled = false;

            device.addEventListener('gattserverdisconnected', onDisconnected);

        } catch (error) {
            log('Argh! ' + error);
        }
    });

    disconnectButton.addEventListener('click', async () => {
        if (!legoMario || !legoMario.gatt.connected) return;
        try {
            await legoCharacteristic.writeValueWithResponse(DISCONNECT_COMMAND);
            log('Disconnected.');
        } catch (error) {
            log('Error disconnecting: ' + error);
        }
    });

    turnOffButton.addEventListener('click', async () => {
        if (!legoMario || !legoMario.gatt.connected) return;
        try {
            await legoCharacteristic.writeValueWithResponse(TURN_OFF_COMMAND);
            log('Turned off.');
        } catch(error) {
            log('Error turning off: ' + error);
        }
    });

    function onDisconnected() {
        log('Device disconnected.');
        statusDisplay.textContent = 'Disconnected';
        connectButton.disabled = false;
        disconnectButton.disabled = true;
        turnOffButton.disabled = true;
        legoMario = null;
        legoCharacteristic = null;
    }

    function handleNotifications(event) {
        const value = event.target.value;
        const data = new DataView(value.buffer);
        const hexData = Array.from(new Uint8Array(value.buffer)).map(b => b.toString(16).padStart(2, '0')).join(' ');

        // Port Value
        if (data.getUint8(2) === 0x45) {
            const port = data.getUint8(3);
            if (port === 0x01) { // Camera Sensor Data
                const byte4 = data.getUint8(4);
                const byte5 = data.getUint8(5);
                const byte6 = data.getUint8(6);
                const byte7 = data.getUint8(7);

                if (byte4 === 0xff && byte5 === 0xff && byte6 === 0xff && byte7 === 0xff) {
                    log("Camera idle");
                    tileDisplay.textContent = "Idle";
                } else if (byte6 === 0xff && byte7 === 0xff) { // Barcode
                    const barcode = byte4 | (byte5 << 8);
                    log(`Barcode: 0x${barcode.toString(16)}`);
                    tileDisplay.textContent = `Barcode: 0x${barcode.toString(16)}`;
                } else if (byte4 === 0xff && byte5 === 0xff) { // Color
                    const color = HEX_TO_COLOR_TILE[byte6] || `Unknown Color: 0x${byte6.toString(16)}`;
                    log(`Ground: ${color}`);
                    tileDisplay.textContent = color;
                } else { // RGB Tile
                    const tileCode = data.getUint32(4, true);
                    const tileName = HEX_TO_RGB_TILE[tileCode] || `Unknown Tile Code: 0x${tileCode.toString(16)}`;
                    log(`Tile: ${tileName}`);
                    tileDisplay.textContent = tileName;
                }
            } else if (port === 0x00) { // Accelerometer data
                const x = signed(data.getUint8(4));
                const y = signed(data.getUint8(5));
                const z = signed(data.getUint8(6));
                accXDisplay.textContent = x;
                accYDisplay.textContent = y;
                accZDisplay.textContent = z;
            } else if (port === 0x02) { // Pants data
                const pants = HEX_TO_PANTS[data.getUint8(4)] || 'Unknown';
                log(`Pants: ${pants}`);
                pantsDisplay.textContent = pants;
            }
        } else {
            log(`Unknown message: ${hexData}`);
        }
    }
});
