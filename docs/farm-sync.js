// Each cloud write is conditional on the revision this device actually opened.
export class FarmSync {
  constructor({cache, persist, read, write, restore, status, active, seed}) {
    Object.assign(this, {cache, persist, read, write, restore, status, active, seed});
    this.conflict = null;
  }

  remember() {
    this.persist(this.cache);
  }

  edit(snapshot) {
    this.cache.snapshot = snapshot;
    this.cache.id = crypto.randomUUID();
    this.remember();
  }

  adopt(row) {
    this.cache = {base: row.revision, id: row.revision, snapshot: row.snapshot};
    this.conflict = null;
    this.remember();
    this.restore(row.snapshot);
  }

  get dirty() {
    return this.cache && this.cache.id !== this.cache.base;
  }

  run() {
    if (!this.job) this.job = this.exchange().finally(() => { this.job = null; });
    return this.job;
  }

  async exchange() {
    try {
      const row = await this.read();
      if (!this.active()) return;
      if (!this.cache) {
        if (row) this.adopt(row);
        else {
          this.cache = {base: null};
          this.edit(this.seed());
          this.restore(this.cache.snapshot);
        }
      } else if (row && this.cache.attempt === row.revision) {
        // Also handles a successful upload whose response never reached us.
        this.cache.base = row.revision;
        delete this.cache.attempt;
        this.remember();
      } else if ((row?.revision ?? null) !== this.cache.base) {
        if (!this.dirty && row) this.adopt(row);
        else {
          this.conflict = {row};
          this.status('conflict');
          return;
        }
      }
      if (this.conflict) { this.status('conflict'); return; }
      if (this.dirty) {
        const {base, id, snapshot} = this.cache;
        this.cache.attempt = id;
        this.remember();
        const accepted = await this.write(base, id, snapshot);
        if (!this.active()) return;
        if (!accepted) {
          const latest = await this.read();
          if (!this.active()) return;
          this.conflict = {row: latest};
          this.status('conflict');
          return;
        }
        this.cache.base = id;
        delete this.cache.attempt;
        this.remember();
      }
      this.status(this.dirty ? 'queued' : 'synced');
    } catch (error) {
      if (this.active()) this.status('offline', error);
    }
  }

  resolve(useDevice) {
    if (!this.conflict) return;
    const {row} = this.conflict;
    if (!useDevice && row) this.adopt(row);
    else {
      this.cache.base = row?.revision ?? null;
      delete this.cache.attempt;
      this.conflict = null;
      this.edit(this.cache.snapshot);
    }
    return this.run();
  }
}
