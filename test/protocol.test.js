'use strict';

const assert = require('assert');
const protocol = require('../lib/protocol');
const classMap = require('./fixtures/class_map');

describe('test/protocol.test.js', () => {
  it('should requestEncode ok', () => {
    const buf = protocol.requestEncode(1, {
      args: [{
        $class: 'java.lang.String',
        $: 'test',
      }],
      serverSignature: 'com.test.TestService:1.0',
      methodName: 'test',
      timeout: 300000,
      group: 'HSF',
    });
    assert.deepEqual(Buffer.from('dabbc20000000000000000010000007a05352e332e3014636f6d2e746573742e546573745365727669636503312e300474657374124c6a6176612f6c616e672f537472696e673b04746573744805647562626f05352e332e300567726f757003485346047061746814636f6d2e746573742e54657374536572766963650776657273696f6e03312e305a', 'hex'), buf);

    const req = protocol.decode(buf);
    assert(req.meta && req.meta.size === 138);
    delete req.meta;
    assert.deepEqual({
      packetId: 1,
      packetType: 'request',
      data: {
        methodName: 'test',
        serverSignature: 'com.test.TestService:1.0',
        args: [ 'test' ],
        methodArgSigs: [ 'java.lang.String' ],
        requestProps: { dubbo: '5.3.0', path: 'com.test.TestService', version: '1.0', group: 'HSF' },
      },
      options: {
        protocolType: 'dubbo',
        codecType: 'hessian2',
        classMap: undefined,
      },
    }, req);

  });

  it('should responseEncode ok', () => {
    const buf = protocol.responseEncode(1, {
      isError: false,
      appResponse: 'ok',
    });
    assert.deepEqual(Buffer.from('dabb021400000000000000010000000491026f6b', 'hex'), buf);

    const res = protocol.decode(buf);
    assert(res.meta && res.meta.size === 20);
    delete res.meta;
    assert.deepEqual({
      packetId: 1,
      packetType: 'response',
      data: { appResponse: 'ok', error: null, responseProps: null },
      options: {
        protocolType: 'dubbo',
        codecType: 'hessian2',
        classMap: undefined,
      },
    }, res);
  });

  it('should heartbeatEncode ok', () => {
    const buf = protocol.heartbeatEncode(1);
    assert.deepEqual(Buffer.from('dabbe2000000000000000001000000014e', 'hex'), buf);

    const hb = protocol.decode(buf);
    assert(hb.meta && hb.meta.size === 17);
    delete hb.meta;
    assert.deepEqual({
      packetId: 1,
      packetType: 'heartbeat',
      data: null,
      options: {
        protocolType: 'dubbo',
        codecType: 'hessian2',
        classMap: undefined,
      },
    }, hb);

  });

  it('should heartbeatAckEncode ok', () => {
    const buf = protocol.heartbeatAckEncode(1);
    assert.deepEqual(Buffer.from('dabb22140000000000000001000000014e', 'hex'), buf);

    const hbAck = protocol.decode(buf);
    assert(hbAck.meta && hbAck.meta.size === 17);
    delete hbAck.meta;
    assert.deepEqual({
      packetId: 1,
      packetType: 'heartbeat_ack',
      data: null,
      options: {
        protocolType: 'dubbo',
        codecType: 'hessian2',
        classMap: undefined,
      },
    }, hbAck);
  });

  const obj = {
    b: true,
    name: 'testname',
    field: 'xxxxx',
    testObj2: { name: 'xxx', finalField: 'xxx' },
    testEnum: { name: 'B' },
    testEnum2: [{ name: 'B' }, { name: 'C' }],
    bs: Buffer.from([ 0x02, 0x00, 0x01, 0x07 ]),
    list1: [{ name: 'A' }, { name: 'B' }],
    list2: [ 2017, 2016 ],
    list3: [{ name: 'aaa', finalField: 'xxx' },
      { name: 'bbb', finalField: 'xxx' },
    ],
    list4: [ 'xxx', 'yyy' ],
    list5: [ Buffer.from([ 0x02, 0x00, 0x01, 0x07 ]), Buffer.from([ 0x02, 0x00, 0x01, 0x06 ]) ],
    map1: { 2017: { name: 'B' } },
    map2: {
      2107: 2106,
    },
    map3: {},
    map4: { xxx: 'yyy' },
    map5: { 2017: Buffer.from([ 0x02, 0x00, 0x01, 0x06 ]) },
  };

  it('should encode complex object', () => {
    const options = { classMap };
    const buf = protocol.requestEncode(1, {
      args: [{
        $class: 'com.alipay.test.TestObj',
        $: obj,
      }],
      serverSignature: 'com.alipay.test.TestService:1.0',
      methodName: 'echoObj',
      requestProps: {},
      timeout: 3000,
      group: 'HSF',
    }, options);
    const expect = Buffer.from('dabbc20000000000000000010000020905352e332e301b636f6d2e616c697061792e746573742e546573745365727669636503312e30076563686f4f626a194c636f6d2f616c697061792f746573742f546573744f626a3b4317636f6d2e616c697061792e746573742e546573744f626aa1016208746573744f626a32046e616d65056669656c640874657374456e756d0974657374456e756d32026273056c69737431056c69737432056c69737433056c69737434056c69737435046d617031046d617032046d617033046d617034046d6170356054431c636f6d2e616c697061792e746573742e7375622e546573744f626a3292046e616d650a66696e616c4669656c6461037878780378787808746573746e616d650578787878784318636f6d2e616c697061792e746573742e54657374456e756d91046e616d6562014272195b636f6d2e616c697061792e746573742e54657374456e756d6201426201432402000107720e6a6176612e7574696c2e4c6973746201416201427291cfe1cfe072916103616161037878786103626262037878787291037878780379797972912402000107240200010648ffe16201425a48d4083bd4083a5a485a4803787878037979795a48043230313724020001065a4805647562626f05352e332e300567726f75700348534604706174681b636f6d2e616c697061792e746573742e54657374536572766963650776657273696f6e03312e305a', 'hex');
    assert.deepEqual(expect, buf);

    const req = protocol.decode(buf, options);
    assert(req.meta && req.meta.size === 537);
    delete req.meta;
    assert.deepEqual({
      packetId: 1,
      packetType: 'request',
      data: {
        methodName: 'echoObj',
        serverSignature: 'com.alipay.test.TestService:1.0',
        args: [ obj ],
        methodArgSigs: [ 'com.alipay.test.TestObj' ],
        requestProps: {
          dubbo: '5.3.0',
          path: 'com.alipay.test.TestService',
          version: '1.0',
          group: 'HSF',
        },
      },
      options: {
        protocolType: 'dubbo',
        codecType: 'hessian2',
        classMap,
      },
    }, req);
  });

  it('should decode value with attachment', () => {
    const buf = Buffer.from('dabb021400000000000000010000004994303848656c6c6f207a6f6e6779752c20726573706f6e73652066726f6d2070726f76696465723a203139322e3136382e39392e313a32303838304805647562626f05322e302e325a', 'hex');
    const resp = protocol.decode(buf);

    assert(resp.meta && resp.meta.size === 89);
    delete resp.meta;
    assert.deepEqual(resp, {
      packetId: 1,
      packetType: 'response',
      data: {
        appResponse: 'Hello zongyu, response from provider: 192.168.99.1:20880',
        error: null,
        responseProps: { dubbo: '2.0.2' },
      },
      options: {
        protocolType: 'dubbo',
        codecType: 'hessian2',
        classMap: undefined,
      },
    });
  });
});
