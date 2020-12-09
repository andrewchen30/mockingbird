// package: pb
// file: pkg/pb/events.proto

import * as jspb from 'google-protobuf';

export class StatusEvent extends jspb.Message {
  getEnvoy(): string;
  setEnvoy(value: string): void;

  getMockingbird(): string;
  setMockingbird(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StatusEvent.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: StatusEvent
  ): StatusEvent.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: StatusEvent,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): StatusEvent;
  static deserializeBinaryFromReader(
    message: StatusEvent,
    reader: jspb.BinaryReader
  ): StatusEvent;
}

export namespace StatusEvent {
  export type AsObject = {
    envoy: string;
    mockingbird: string;
  };
}

export class HttpLogEvent extends jspb.Message {
  getAuthority(): string;
  setAuthority(value: string): void;

  getPath(): string;
  setPath(value: string): void;

  getUserAgent(): string;
  setUserAgent(value: string): void;

  getReqId(): string;
  setReqId(value: string): void;

  getReqMethod(): string;
  setReqMethod(value: string): void;

  getResCode(): number;
  setResCode(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HttpLogEvent.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: HttpLogEvent
  ): HttpLogEvent.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: HttpLogEvent,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): HttpLogEvent;
  static deserializeBinaryFromReader(
    message: HttpLogEvent,
    reader: jspb.BinaryReader
  ): HttpLogEvent;
}

export namespace HttpLogEvent {
  export type AsObject = {
    authority: string;
    path: string;
    userAgent: string;
    reqId: string;
    reqMethod: string;
    resCode: number;
  };
}
