import { describe, test, expect, afterEach, afterAll } from 'vitest'
import { EStoreClient, EventIndexConflict } from '@blackglory/estore-js'
import { EStoreService } from '@src/estore-service.js'
import { each } from 'extra-promise'
import { JSONValue } from '@blackglory/prelude'
import { IRecord } from 'extra-workflow'
import { getErrorPromise } from 'return-style'

const server = 'ws://estore:8080'
const client = await EStoreClient.create({ server })

afterEach(async () => {
  const namespaces = await client.getAllNamespaces()
  await each(namespaces, async namespace => {
    await client.clearItemsByNamespace(namespace)
  })
})

afterAll(async () => {
  await client.close()
})

describe('StoreService', () => {
  describe('set', () => {
    describe('record does not exist', () => {
      test('index is the next index', async () => {
        const store = new EStoreService<JSONValue>(
          client
        , 'namespace'
        , 'item'
        , {
            fromJSONValue: passThrough
          , toJSONValue: passThrough
          }
        )
        const record: IRecord<string> = {
          type: 'result'
        , value: 'value'
        }

        await store.set(0, record)

        expect(await store.dump()).toStrictEqual([
          record
        ])
      })

      test('index is not the next index', async () => {
        const store = new EStoreService<JSONValue>(
          client
        , 'namespace'
        , 'item'
        , {
            fromJSONValue: passThrough
          , toJSONValue: passThrough
          }
        )
        const record: IRecord<string> = {
          type: 'result'
        , value: 'value'
        }

        const err = await getErrorPromise(store.set(1, record))

        expect(err).toBeInstanceOf(EventIndexConflict)
      })
    })

    test('record exists', async () => {
      const store = new EStoreService<JSONValue>(
        client
      , 'namespace'
      , 'item'
      , {
          fromJSONValue: passThrough
        , toJSONValue: passThrough
        }
      )
      const oldRecord: IRecord<string> = {
        type: 'result'
      , value: 'old-value'
      }
      await store.set(0, oldRecord)
      const newRecord: IRecord<string> = {
        type: 'result'
      , value: 'new-value'
      }

      const err = await getErrorPromise(store.set(0, newRecord))

      expect(err).toBeInstanceOf(EventIndexConflict)
    })
  })

  describe('get', () => {
    test('record exists', async () => {
      const store = new EStoreService<JSONValue>(
        client
      , 'namespace'
      , 'item'
      , {
          fromJSONValue: passThrough
        , toJSONValue: passThrough
        }
      )
      const record: IRecord<string> = {
        type: 'result'
      , value: 'value'
      }
      await store.set(0, record)

      const result = await store.get(0)

      expect(result).toStrictEqual(record)
    })

    test('event does not exist', async () => {
      const store = new EStoreService<JSONValue>(
        client
      , 'namespace'
      , 'item'
      , {
          fromJSONValue: passThrough
        , toJSONValue: passThrough
        }
      )

      const result = await store.get(0)

      expect(result).toBeUndefined()
    })
  })

  test('clear', async () => {
    const store = new EStoreService<JSONValue>(
      client
    , 'namespace'
    , 'item'
    , {
        fromJSONValue: passThrough
      , toJSONValue: passThrough
      }
    )
    const record: IRecord<string> = {
      type: 'result'
    , value: 'value'
    }
    await store.set(0, record)

    await store.clear()

    expect(await store.dump()).toStrictEqual([])
  })

  test('dump', async () => {
    const store = new EStoreService<JSONValue>(
      client
    , 'namespace'
    , 'item'
    , {
        fromJSONValue: passThrough
      , toJSONValue: passThrough
      }
    )
    const record1: IRecord<string> = {
      type: 'result'
    , value: 'value-1'
    }
    const record2: IRecord<string> = {
      type: 'result'
    , value: 'value-2'
    }
    await store.set(0, record1)
    await store.set(1, record2)

    const result = await store.dump()

    expect(result).toStrictEqual([
      record1
    , record2
    ])
  })
})

function passThrough<T>(value: T): T {
  return value
}
