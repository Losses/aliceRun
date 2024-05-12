import { JoyCon, JoyConLeft, JoyConRight } from './JoyCon';

/**
 * Copy and pasted from https://github.com/tomayac/joy-con-webhid/blob/main/src/index.js
 * Converted to TypeScript
 */

export const CONNECTED_JOY_CON: JoyCon[] = [];
const NINTENDO = 0x057e;

const connectDevice = async (device: HIDDevice) => {
  let joyCon: JoyConLeft | JoyConRight;
  if (device.productId === 0x2006) {
    joyCon = new JoyConLeft(device);
  } else if (device.productId === 0x2007) {
    joyCon = new JoyConRight(device);
  } else {
    throw new Error('Wrong device type');
  }

  await joyCon.open();
  await joyCon.enableStandardFullMode();
  await joyCon.enableIMUMode();
  return joyCon;
};

export const connectToNintendoSwitchJoycon = async () => {
  // Filter on devices with the Nintendo Switch Joy-Con USB Vendor/Product IDs.
  const filters = [
    {
      vendorId: NINTENDO,
      productId: 0x2006, // Joy-Con Left
    },
    {
      vendorId: NINTENDO,
      productId: 0x2007, // Joy-Con Right
    },
  ];
  // Prompt user to select a Joy-Con device.
  try {
    const [device] = await navigator.hid.requestDevice({ filters });

    if (!device) return undefined;

    const joyCon = await connectDevice(device);
    CONNECTED_JOY_CON.push(joyCon);

    const onDisconnect = (event: HIDConnectionEvent) => {      
      if (event.device === device) {
        navigator.hid.removeEventListener('disconnect', onDisconnect);

        var index = CONNECTED_JOY_CON.indexOf(joyCon);
        if (index !== -1) {
          CONNECTED_JOY_CON.splice(index, 1);
        }
      }
    }

    navigator.hid.addEventListener('disconnect', onDisconnect);

    return joyCon;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.name, error.message);
    } else {
      console.error(error);
    }

    return undefined;
  }
};