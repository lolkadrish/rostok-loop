import test from 'node:test';
import assert from 'node:assert/strict';
import {FarmSync} from '../docs/farm-sync.js';

function device(server, cache) {
  return new FarmSync({
    cache, active: () => true, persist() {}, restore() {}, status() {},
    seed: () => ({code: 'guest'}),
    read: async () => structuredClone(server.row),
    write: async (base, revision, snapshot) => {
      if (base !== (server.row?.revision ?? null)) return false;
      server.row = {revision, snapshot};
      return true;
    },
  });
}

test('a new account adopts the guest save and a second device restores the account', async () => {
  const server = {}, first = device(server), second = device(server);
  await first.run();
  first.edit({code:'harvest()'}); await first.run();
  await second.run();
  assert.deepEqual(second.cache.snapshot, {code:'harvest()'});
});

test('simultaneous edits wait for a choice and do not overwrite the other device', async () => {
  const server = {}, a = device(server), b = device(server);
  await a.run(); await b.run();
  a.edit({code:'first'}); b.edit({code:'second'});
  await Promise.all([a.run(), b.run()]);
  const loser = a.conflict ? a : b;
  assert.ok(loser.conflict); assert.notEqual(server.row.snapshot.code, loser.cache.snapshot.code);
  await loser.resolve(true);
  assert.equal(server.row.snapshot.code, loser.cache.snapshot.code);
});

test('retry preserves a newer edit after the previous upload response was lost', async () => {
  const server = {}, a = device(server);
  await a.run(); a.edit({code:'one'});
  const write = a.write;
  a.write = async (...args) => { await write(...args); throw Error('response lost'); };
  await a.run(); a.edit({code:'two'});
  const reopened = device(server, structuredClone(a.cache));
  await reopened.run();
  assert.equal(server.row.snapshot.code, 'two'); assert.equal(reopened.dirty, false);
});

test('a failed first download never overwrites the pre-existing cloud save', async () => {
  const server = {row:{revision:'existing', snapshot:{code:'existing code'}}};
  const a = device(server), read = a.read;
  a.read = async () => { throw Error('offline'); };
  await a.run(); assert.equal(a.cache, undefined);
  a.read = read; await a.run();
  assert.equal(a.cache.snapshot.code, 'existing code');
});
