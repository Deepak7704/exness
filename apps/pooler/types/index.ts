export interface BinanceTradeData{
    stream:string,
    data:{
        e:string,
        E:number,
        s:string,
        t:number,
        p:string,
        q:string,
        T:number
    }
}