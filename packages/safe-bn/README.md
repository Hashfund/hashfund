# @hashfund/bn

## To install

```
bun install @hashfund/bn
```

## Usage 

By default safe-bn support 3 decimal places to increase add the optional decimal param

### Perform BigNumber mathematical operations

```ts
const target = 3124.456;
const safeBnRepresentation = safeBN(target);
// reverse to unSafe after performing mathematical operations
const unSafeRepresentation = unSafe(safeRepresentation);
```

### Convert to Number from hex or BN

```ts
/// This unwrap safeBN, note don't pass unSafe output, convert first to save before this
const backToTarget = unSafeToNumber(safeRepresentation);
```


