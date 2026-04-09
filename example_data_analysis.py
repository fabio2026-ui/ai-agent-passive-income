"""
数据分析脚本 - 销售数据处理
用于读取销售数据CSV，计算月度统计，并生成报告
"""

import pandas as pd
import os
import json
import time

def readData(filename):
    df=pd.read_csv(filename)
    return df

def calc_stats(data):
    result={}
    months=data['month'].unique()
    for m in months:
        subset=data[data['month']==m]
        total=subset['amount'].sum()
        avg=subset['amount'].mean()
        result[m]={'total':total,'avg':avg}
    return result

def process_all(files):
    all_data=[]
    for f in files:
        try:
            d=readData(f)
            all_data.append(d)
        except Exception as e:
            print("error:"+str(e))
            continue
    combined=pd.concat(all_data)
    stats=calc_stats(combined)
    return stats

def save_report(stats,output_file):
    with open(output_file,'w') as f:
        json.dump(stats,f)
    print("saved to "+output_file)

def main():
    files=["sales_jan.csv","sales_feb.csv","sales_mar.csv"]
    start=time.time()
    stats=process_all(files)
    save_report(stats,"report.json")
    print("Done in "+str(time.time()-start)+" seconds")

if __name__=="__main__":
    main()
