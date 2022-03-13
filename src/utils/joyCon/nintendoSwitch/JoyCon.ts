/**
 * Code from https://github.com/tomayac/joy-con-webhid/blob/main/src/joycon.js
 * Converted to Typescript
 */

import * as PacketParser from './parser';
import { concatTypedArrays } from '../../concateTypedArray';

interface IParseResult {
  _raw: Uint8Array;
  _hex: string[];
}

interface IPoint3 {
  x: number;
  y: number;
  z: number;
}

interface IAngle3 {
  alpha: string;
  beta: string;
  gamma: string;
}

interface IPoint4 {
  w: number;
  x: number;
  y: number;
  z: number;
}

interface IDeviceInfo {
  firmwareVersion: {
    major: number;
    minor: number;
  };
  type: string;
  macAddress: string;
  spiColorInUse: boolean;
}

interface IBatteryLevel { level: string };

export interface IPacket {
  inputReportID?: IParseResult;
  analogStick?: IParseResult;
  filter?: IParseResult;
  timer?: IParseResult;
  batteryLevel?: IParseResult & IBatteryLevel;
  connectionInfo?: IParseResult;
  analogStickLeft?: IParseResult & { horizontal: string; vertical: string };
  analogStickRight?: IParseResult & { horizontal: string; vertical: string };
  vibrator?: IParseResult;
  ack?: IParseResult;
  subcommandID?: IParseResult;
  subcommandReplyData?: IParseResult;
  deviceInfo?: {
    _raw: Uint8Array;
    _hex: Uint8Array;
  } & IDeviceInfo;
  accelerometers?: IAcceleroMeter[];
  gyroscopes?: IGyroscope[][];
  actualAccelerometer?: IPoint3;
  actualOrientation?: IAngle3;
  actualOrientationQuaternion?: IAngle3;
  actualGyroscope?: {
    dps: IPoint3;
    rps: IPoint3;
  };
  quaternion?: IPoint4;
  buttonStatus?: {
    x?: boolean;
    y?: boolean;
    b?: boolean;
    a?: boolean;
    plus?: boolean;
    r?: boolean;
    zr?: boolean;
    home?: boolean;
    rightStick?: boolean;
    up?: boolean;
    down?: boolean;
    left?: boolean;
    right?: boolean;
    minus?: boolean;
    l?: boolean;
    zl?: boolean;
    capture?: boolean;
    leftStick?: boolean;
  } & IParseResult;
}

export interface IAcceleroMeter {
  x: {
    _raw: Uint8Array;
    _hex: string[];
    acc: number;
  };
  y: {
    _raw: Uint8Array;
    _hex: string[];
    acc: number;
  };
  z: {
    _raw: Uint8Array;
    _hex: string[];
    acc: number;
  };
}

export interface IGyroscope {
  _raw: Uint8Array;
  _hex: string[];
  dps: number;
  rps: number;
}

export class JoyCon extends EventTarget {
  constructor(private device: HIDDevice) {
    super();
  }

  /**
   * Opens the device.
   */
  async open() {
    if (!this.device.opened) {
      await this.device.open();
    }
    this.device.addEventListener('inputreport', this._onInputReport.bind(this));
  }

  /**
   * Requests information about the device.
   */
  async getRequestDeviceInfo() {
    const outputReportID = 0x01;
    const subcommand = [0x02];
    const data = [
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      ...subcommand,
    ];
    await this.device.sendReport(outputReportID, new Uint8Array(data));

    return new Promise<IDeviceInfo>((resolve) => {
      const onDeviceInfo = ({ detail: deviceInfo }: { detail: IPacket['deviceInfo'] }) => {
        this.removeEventListener('deviceinfo', onDeviceInfo as unknown as EventListener);
        const clearedDevideInfo = { ...deviceInfo };
        delete clearedDevideInfo._raw;
        delete clearedDevideInfo._hex;
        resolve(deviceInfo as IDeviceInfo);
      };
      this.addEventListener('deviceinfo', onDeviceInfo as unknown as EventListener);
    });
  }

  /**
   * Requests information about the battery.
   */
  async getBatteryLevel() {
    const outputReportID = 0x01;
    const subCommand = [0x50];
    const data = [
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      ...subCommand,
    ];
    await this.device.sendReport(outputReportID, new Uint8Array(data));

    return new Promise<IBatteryLevel>((resolve) => {
      const onBatteryLevel = ({ detail: batteryLevel }: { detail: IPacket['batteryLevel'] }) => {
        this.removeEventListener('batterylevel', onBatteryLevel as unknown as EventListener);
        const clearedBatteryLevel = { ...batteryLevel };
        delete clearedBatteryLevel._raw;
        delete clearedBatteryLevel._hex;
        resolve(batteryLevel as IBatteryLevel);
      };
      this.addEventListener('batterylevel', onBatteryLevel as unknown as EventListener);
    });
  }

  /**
   * Enables simple HID mode.
   */
  async enableSimpleHIDMode() {
    const outputReportID = 0x01;
    const subcommand = [0x03, 0x3f];
    const data = [
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      ...subcommand,
    ];
    await this.device.sendReport(outputReportID, new Uint8Array(data));
  }

  /**
   * Enables standard full mode.
   */
  async enableStandardFullMode() {
    const outputReportID = 0x01;
    const subcommand = [0x03, 0x30];
    const data = [
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      ...subcommand,
    ];
    await this.device.sendReport(outputReportID, new Uint8Array(data));
  }

  /**
   * Enables EMU mode.
   */
  async enableIMUMode() {
    const outputReportID = 0x01;
    const subcommand = [0x40, 0x01];
    const data = [
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      ...subcommand,
    ];
    await this.device.sendReport(outputReportID, new Uint8Array(data));
  }

  /**
   * Disables IMU mode.
   */
  async disableIMUMode() {
    const outputReportID = 0x01;
    const subcommand = [0x40, 0x00];
    const data = [
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      ...subcommand,
    ];
    await this.device.sendReport(outputReportID, new Uint8Array(data));
  }

  /**
   * Enables vibration.
   */
  async enableVibration() {
    const outputReportID = 0x01;
    const subcommand = [0x48, 0x01];
    const data = [
      0x00,
      0x00,
      0x01,
      0x40,
      0x40,
      0x00,
      0x01,
      0x40,
      0x40,
      ...subcommand,
    ];
    await this.device.sendReport(outputReportID, new Uint8Array(data));
  }

  /**
   * Disables vibration.
   */
  async disableVibration() {
    const outputReportID = 0x01;
    const subcommand = [0x48, 0x00];
    const data = [
      0x00,
      0x00,
      0x01,
      0x40,
      0x40,
      0x00,
      0x01,
      0x40,
      0x40,
      ...subcommand,
    ];
    await this.device.sendReport(outputReportID, new Uint8Array(data));
  }

  async rumble(lowFrequency: number, highFrequency: number, amplitude: number) {
    const clamp = (value: number, min: number, max: number) => {
      return Math.min(Math.max(value, min), max);
    };
    const outputReportID = 0x10;
    const data = new Uint8Array(9);

    // Referenced codes below:
    // https://github.com/Looking-Glass/JoyconLib/blob/master/Packages/com.lookingglass.joyconlib/JoyconLib_scripts/Joycon.cs
    data[0] = 0x00;

    let lf = clamp(lowFrequency, 40.875885, 626.286133);
    let hf = clamp(highFrequency, 81.75177, 1252.572266);

    hf = (Math.round(32 * Math.log2(hf * 0.1)) - 0x60) * 4;
    lf = Math.round(32 * Math.log2(lf * 0.1)) - 0x40;

    const amp = clamp(amplitude, 0, 1);

    let hfAmp;
    if (amp == 0) {
      hfAmp = 0;
    } else if (amp < 0.117) {
      hfAmp = (Math.log2(amp * 1000) * 32 - 0x60) / (5 - Math.pow(amp, 2)) - 1;
    } else if (amp < 0.23) {
      hfAmp = Math.log2(amp * 1000) * 32 - 0x60 - 0x5c;
    } else {
      hfAmp = (Math.log2(amp * 1000) * 32 - 0x60) * 2 - 0xf6;
    }

    let lfAmp = Math.round(hfAmp) * 0.5;
    const parity = lfAmp % 2;
    if (parity > 0) {
      --lfAmp;
    }
    lfAmp = lfAmp >> 1;
    lfAmp += 0x40;
    if (parity > 0) {
      lfAmp |= 0x8000;
    }

    data[1] = hf & 0xff;
    data[2] = hfAmp + ((hf >>> 8) & 0xff);
    data[3] = lf + ((lfAmp >>> 8) & 0xff);
    data[4] += lfAmp & 0xff;

    for (let i = 0; i < 4; i++) {
      data[5 + i] = data[1 + i];
    }

    await this.device.sendReport(outputReportID, new Uint8Array(data));
  }

  _receiveInputEvent(_: IPacket) {

  }

  /**
   * Deal with `oninputreport` events.
   */
  _onInputReport(event: HIDInputReportEvent) {
    let { reportId, device } = event;

    let data = event.data as unknown as Uint8Array;

    if (!data) return;

    data = concatTypedArrays(
      new Uint8Array([reportId]),
      new Uint8Array(data.buffer)
    );

    const hexData = (data as unknown as number[]).map((byte) => byte.toString(16));

    let packet: IPacket = {
      inputReportID: PacketParser.parseInputReportID(data, hexData),
    };

    switch (reportId) {
      case 0x3f: {
        packet = {
          ...packet,
          buttonStatus: PacketParser.parseButtonStatus(data, hexData),
          analogStick: PacketParser.parseAnalogStick(data, hexData),
          filter: PacketParser.parseFilter(data, hexData),
        };
        break;
      }
      case 0x21:
      case 0x30: {
        packet = {
          ...packet,
          timer: PacketParser.parseTimer(data, hexData),
          batteryLevel: PacketParser.parseBatteryLevel(data, hexData),
          connectionInfo: PacketParser.parseConnectionInfo(data, hexData),
          buttonStatus: PacketParser.parseCompleteButtonStatus(data, hexData),
          analogStickLeft: PacketParser.parseAnalogStickLeft(data, hexData),
          analogStickRight: PacketParser.parseAnalogStickRight(data, hexData),
          vibrator: PacketParser.parseVibrator(data, hexData),
        };

        if (reportId === 0x21) {
          packet = {
            ...packet,
            ack: PacketParser.parseAck(data, hexData),
            subcommandID: PacketParser.parseSubcommandID(data, hexData),
            subcommandReplyData: PacketParser.parseSubcommandReplyData(
              data,
              hexData
            ),
            deviceInfo: PacketParser.parseDeviceInfo(data, hexData),
          };
        }

        if (reportId === 0x30) {
          const accelerometers = PacketParser.parseAccelerometers(
            data,
            hexData
          );
          const gyroscopes = PacketParser.parseGyroscopes(data, hexData);
          const rps = PacketParser.calculateActualGyroscope(
            gyroscopes.map((g) => g.map((v) => v.rps))
          );
          const dps = PacketParser.calculateActualGyroscope(
            gyroscopes.map((g) => g.map((v) => v.dps))
          );
          const acc = PacketParser.calculateActualAccelerometer(
            accelerometers.map((a) => [a.x.acc, a.y.acc, a.z.acc])
          );
          const quaternion = PacketParser.toQuaternion(
            rps,
            acc,
            device.productId
          );

          packet = {
            ...packet,
            accelerometers,
            gyroscopes,
            actualAccelerometer: acc,
            actualGyroscope: {
              dps: dps,
              rps: rps,
            },
            actualOrientation: PacketParser.toEulerAngles(
              rps,
              acc,
              device.productId
            ),
            actualOrientationQuaternion: PacketParser.toEulerAnglesQuaternion(
              quaternion
            ),
            quaternion: quaternion,
          };
        }
        break;
      }
    }
    if (packet.deviceInfo?.type) {
      this._receiveDeviceInfo(packet.deviceInfo);
    }
    if (packet.batteryLevel?.level) {
      this._receiveBatteryLevel(packet.batteryLevel);
    }
    this._receiveInputEvent(packet);
  }

  _receiveDeviceInfo(deviceInfo: IPacket['deviceInfo']) {
    this.dispatchEvent(new CustomEvent('deviceinfo', { detail: deviceInfo }));
  }

  _receiveBatteryLevel(batteryLevel: IPacket['batteryLevel']) {
    this.dispatchEvent(
      new CustomEvent('batterylevel', { detail: batteryLevel })
    );
  }
}

class JoyConLeft extends JoyCon {
  /**
   * Creates an instance of JoyConLeft.
   * @param {HIDDevice} device
   * @memberof JoyConLeft
   */
  constructor(device: HIDDevice) {
    super(device);
  }

  _receiveInputEvent(packet: IPacket) {
    delete packet.buttonStatus?.x;
    delete packet.buttonStatus?.y;
    delete packet.buttonStatus?.b;
    delete packet.buttonStatus?.a;
    delete packet.buttonStatus?.plus;
    delete packet.buttonStatus?.r;
    delete packet.buttonStatus?.zr;
    delete packet.buttonStatus?.home;
    delete packet.buttonStatus?.rightStick;

    this.dispatchEvent(new CustomEvent('hidinput', { detail: packet }));
  }
}

/**
 *
 *
 * @class JoyConRight
 * @extends {JoyCon}
 */
class JoyConRight extends JoyCon {
  /**
   *Creates an instance of JoyConRight.
   * @param {HIDDevice} device
   * @memberof JoyConRight
   */
  constructor(device: HIDDevice) {
    super(device);
  }

  _receiveInputEvent(packet: IPacket) {
    delete packet.buttonStatus?.up;
    delete packet.buttonStatus?.down;
    delete packet.buttonStatus?.left;
    delete packet.buttonStatus?.right;
    delete packet.buttonStatus?.minus;
    delete packet.buttonStatus?.l;
    delete packet.buttonStatus?.zl;
    delete packet.buttonStatus?.capture;
    delete packet.buttonStatus?.leftStick;

    this.dispatchEvent(new CustomEvent('hidinput', { detail: packet }));
  }
}

export { JoyConLeft, JoyConRight };