# @extra-workflow/blackglory-estore-service
## Install
```sh
npm install --save @extra-workflow/blackglory-estore-service
# or
yarn add @extra-workflow/blackglory-estore-service
```

## API
### EStoreService
```ts
class EStoreService<T> implements IStore<T> {
  constructor(
    client: EStoreClient
  , namespace: string
  , options: {
      toJSONValue: (value: T) => JSONValue
      fromJSONValue: (json: JSONValue) => T
    }
  )
}
```
