/* 2.1 */

export const MISSING_KEY = '__MISSING__'

type PromisedStore<K, V> = {
    get(key: K): Promise<V>,
    set(key: K, value: V): Promise<void>,
    delete(key: K): Promise<void>
}


 export function makePromisedStore<K, V>(): PromisedStore<K, V> {
     let map = new Map()
     return {
         get(key: K) {
           return new Promise<V> ( (resolve, reject) => map.has(key) ? resolve(map.get(key)) : reject(MISSING_KEY));
         },
         set(key: K, value: V) { 
             return new Promise<void> ( (resolve, reject) => {map = map.set(key, value); resolve();});
         },
         delete(key: K) {
            return  new Promise<void> ( (resolve, reject) => map.delete(key) ? resolve() : reject(MISSING_KEY) );
         },
     }
 }

 export function getAll<K, V>(store: PromisedStore<K, V>, keys: K[]): Promise<V[]> {
    return Promise.all(keys.map(key => store.get(key))) 
 }

/* 2.2 */

export async function setAsync<T,R>(param:T, f: (param: T) => R, store:PromisedStore<T,R>):Promise<R>{
    let value = f(param);
    store.set(param,value);
    return value;
}




export function asycMemo<T, R>(f: (param: T) => R): (param: T) => Promise<R> {
    let store = makePromisedStore<T,R>();
    return async function result (param: T):Promise<R> {
    try
    {
        return await store.get(param);
    }
    catch(error)
    {
        return setAsync(param,f,store);
    }
    }
}

/* 2.3 */

export function lazyFilter<T>(genFn: () => Generator<T>, filterFn: (param: T) => boolean): () => Generator<T> {
    function* generator() {
        for(let item of genFn()) {
            if(filterFn(item))
                yield item;
        }
    }
    return generator;
}

 export function lazyMap<T, R>(genFn: () => Generator<T>, mapFn: (param: T) => R): () => Generator<R> {
    function* generator() {
        for(let item of genFn()) {
            yield mapFn(item);
        }
    }
    return generator;
 }

/* 2.4 */
// you can use 'any' in this question


export async function asyncWaterfallWithRetry(fns: ((par:any) => Promise<any>)[]): Promise<any> {   
    let prom: Promise<any> = Promise.resolve(undefined);
    for(let i = 0; i < fns.length; i++){
        prom = prom.then((val: any) => fns[i](val)
        .catch(async (reason: any) => await new Promise<any>((resolve, reject) => setTimeout(() => resolve(fns[i](val)) ,2000)))
        .catch(async (reason: any) => await new Promise<any>((resolve, reject) => setTimeout(() => resolve(fns[i](val)) ,2000))));
    }
    return prom;
}