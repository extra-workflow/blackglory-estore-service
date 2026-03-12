import { IRecord, IStore } from 'extra-workflow'
import { JSONValue } from '@blackglory/prelude'
import { EStoreClient } from '@blackglory/estore-js'

export class EStoreService<T> implements IStore<T> {
  constructor(
    private client: EStoreClient
  , private namespace: string
  , private itemId: string
  , private options: {
      toJSONValue: (value: T) => JSONValue
      fromJSONValue: (json: JSONValue) => T
    }
  ) {}

  async set(index: number, record: IRecord<T>): Promise<void> {
    await this.client.appendEvent(
      this.namespace
    , this.itemId
    , {
        type: record.type
      , value: this.options.toJSONValue(record.value)
      } satisfies IRecord<JSONValue>
    , index
    )
  }

  async get(index: number): Promise<IRecord<T> | undefined> {
    const event = await this.client.getEvent(
      this.namespace
    , this.itemId
    , index
    )

    if (event) {
      const record = event as unknown as IRecord<JSONValue>

      return {
        type: record.type
      , value: this.options.fromJSONValue(record.value)
      }
    }
  }

  async clear(): Promise<void> {
    await this.client.removeItem(this.namespace, this.itemId)
  }

  async dump(): Promise<Array<IRecord<T>>> {
    const events = await this.client.getAllEvents(this.namespace, this.itemId)
    return events.map(event => {
      const record = event as unknown as IRecord<JSONValue>

      return {
        type: record.type
      , value: this.options.fromJSONValue(record.value)
      }
    })
  }
}
