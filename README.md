# @extra-workflow/blackglory-estore-service
## Install
```sh
npm install --save @extra-workflow/blackglory-estore-service
# or
yarn add @extra-workflow/blackglory-estore-service
```

## Limitations
Since EStore restricts events to be written strictly in index order,
**the results of fan-out calls cannot be written correctly**.

## API
### EStoreService
```ts
class EStoreService<T> implements IStore<T> {
  constructor(
    client: EStoreClient
  , namespace: string
  , itemId: string
  , options: {
      toJSONValue: (value: T) => JSONValue
      fromJSONValue: (json: JSONValue) => T
    }
  )
}
```
