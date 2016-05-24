import datetime
import markov
import affinity
import scipy.io as spio
import numpy as np
from scipy.spatial.distance import pdist
from scipy.spatial.distance import squareform

try:
    import json
except ImportError:
    import simplejson as json



from flask import Flask,render_template,request,redirect, jsonify
myapp = Flask(__name__)


def loadmat(filename):
    '''
    this function should be called instead of direct spio.loadmat
    as it cures the problem of not properly recovering python dictionaries
    from mat files. It calls the function check keys to cure all entries
    which are still mat-objects
    '''
    data = spio.loadmat(filename, struct_as_record=False, squeeze_me=True)
    return _check_keys(data)

def _check_keys(dict):
    '''
    checks if entries in dictionary are mat-objects. If yes
    todict is called to change them to nested dictionaries
    '''
    for key in dict:
        if isinstance(dict[key], spio.matlab.mio5_params.mat_struct):
            dict[key] = _todict(dict[key])
    return dict

def _todict(matobj):
    '''
    A recursive function which constructs from matobjects nested dictionaries
    '''
    dict = {}
    for strg in matobj._fieldnames:
        elem = matobj.__dict__[strg]
        if isinstance(elem, spio.matlab.mio5_params.mat_struct):
            dict[strg] = _todict(elem)
        else:
            dict[strg] = elem
    return dict


#load Data
x = loadmat('DATA/dataPATlight.mat')

datapr = x['datarawpr']
datatot = x['datatot']
dates = x['dates']
udates = x['udates']
ave_vlist2 = x['ave2']
ave_vlist3 = x['ave3']
vlist2 = x['v2']
nameID = x['nameID']
tickers = x['tickers']
sdata =  x['sdata']  # sector data


dd = (dates-719529.0)*86400000.0
udates=np.array([datetime.datetime.utcfromtimestamp(a/1000.0) for a in dd])

#snp = np.nanmean(datatot,axis=1)

snp = np.zeros(vlist2.shape[0])
for i in range(0,vlist2.shape[0]):
    fi = vlist2[i] -1
    snp[i] = np.nanmean(datatot[i,fi])

indexSnP = 100.0 * np.cumprod(1+snp/100)

indexSnP = indexSnP.reshape([len(snp),1])
dd = dd.reshape([len(dd),1])
inputSnP = np.hstack((dd,indexSnP))
interval = [dd[0][0], dd[-1][0]]
universe = []


# UTILITY FUNCTIONS

def interval2days(interval):
    period,_ = np.where((dd>=interval[0]) & (dd<=interval[1]))
    return period

def arr2json(arr):
    return json.dumps(arr.tolist())

def json2arr(astr,dtype):
    return np.fromiter(json.loads(astr),dtype)

def selectStocks(data):
    v = np.sum(np.isnan(data),axis=0)
    id = np.where(v==0)
    return id[0]

def diffusion_mat(vecs, vals= None, dtime = 0.0):
    if (dtime!=0):
        vecs = vecs * (vals**dtime)
    dmat = squareform(pdist(vecs,'euclidean'))

    return dmat


def get_sectorWeights(wP):

    idl = np.where(wP!=0)
    idl = idl[0]
    wP = wP[idl]
    sector = sdata[idl]

    dataret = datatot[:,idl]
    dataret = dataret[period,:]
    dataret = dataret*wP

    wsec = []
    retsec = []

    for (i,sec) in enumerate(secL2.keys()):

        fi = np.where(sector==secL2[sec])
        fi = fi[0]

        if len(fi):
            # TO DO
            # MAYBE FILTER OUT SECTORS WITH SMALL WEIGHTS ( < 1/2 %)
            secd={'name':sec,'y':np.sum(wP[fi]), 'color': mycolors[i]}
            wsec.append(secd)

            ret = np.nansum(dataret[:,fi],axis=1)
            ret = (np.prod(1.0+ret/100.0)-1.0)*100
            ret ={'x': sec, 'y':  ret}
            retsec.append(ret)

    return wsec, retsec



def get_piecharts(future=0, Idx=None, knn=5):

    # future= 1 means we take the first day of the interval and see what happens to the stocks in the next period
    # otherwise pick last day of the interval for defining the weights and see what was the perf of these stocks in the past

    wL = ave_vlist2[period[future-1]]
    wS = ave_vlist3[period[future-1]]
    wBench = np.zeros(len(wL))
    wBench[vlist2[period[future-1]]] = 1.0
    wBench = wBench/np.sum(wBench)

    wLshadow = build_shadow(wL,Idx,knn)
    wSshadow = build_shadow(wS,Idx,knn)


    # Long, short and SnP sectorWeights
    wsecL,retsecL = get_sectorWeights(wL)
    wsecS, retsecS = get_sectorWeights(wS)
    wsecBench, retsecBench = get_sectorWeights(wBench)

    wsecLshadow,retsecLshadow = get_sectorWeights(wLshadow)
    wsecSshadow, retsecSshadow = get_sectorWeights(wSshadow)

    return wsecL, wsecS, wsecLshadow, wsecSshadow, wsecBench, retsecL, retsecS, retsecLshadow, retsecSshadow, retsecBench


def build_shadow(w, Idx,  knn=5):

    wshadow = np.zeros(len(w))
    id = np.where(w!=0)
    id = id[0]
    w=w[id]

    index = np.in1d(universe,id)
    index = np.where(index)[0]

    for i in range(0,len(w)):

        c = w[i]
        fi = Idx[index[i],1:(knn+1)] # SHadow Stocks
        wshadow[universe[fi]] += c/(1.0*len(fi))

    return wshadow


def  myNetworkScatter(Afn, dmat, vecs, vals=None, dtime=0.0, n1=2, n2=3, ret= None, label = None, kNN=10):

    if (dtime!=0):
        vecs = vecs * (vals**dtime)

    x=vecs[:,n1]*(vals[n1]**dtime)
    y=vecs[:,n2]*(vals[n1]**dtime)

    nodes = []
    links = []

    for i in range(0,len(x)):

        id = np.argsort(dmat[i])
        id = id[1:kNN+1]
        id = list(id)

        node = {'x1':x[i], 'y1':y[i], 'return': ret[i], 'pos': 0.0,
                'label':label[i], 'index': i, 'links': id,
                'sector': np.int(sdata[universe[i]]),
                'title': label[i], "id": i, 'score': np.sum(Afn[i,id]), 'level':2}

        nodes.append(node)

        for j in range(0,len(id)):
            link = {"source": i, "target": id[j], "weight": 1-dmat[i,id[j]]/np.max(dmat)}
            links.append(link)

    # Locate the Long and Short Stocks
    wL = ave_vlist2[period[future-1]]
    wS = ave_vlist3[period[future-1]]

    idL = np.where(wL>0)
    idL = idL[0]
    wL=wL[idL]
    indexL = np.in1d(universe,idL)
    indexL = np.where(indexL)[0]

    idS = np.where(wS>0)
    idS = idS[0]
    wS=wS[idS]
    indexS = np.in1d(universe,idS)
    indexS = np.where(indexS)[0]

    for i in range(0,len(indexL)):
        nodes[indexL[i]]['pos']= wL[i]*100

    for i in range(0,len(indexS)):
        nodes[indexS[i]]['pos']= -wS[i]*100

    network = {"nodes": nodes, "links": links}

    return network


def buildNetwork(Afn, dmat, labels, kNN=10):

    nodes = []
    links = []

    n = dmat.shape[0]
    for i in range(0,n):

        id = np.argsort(dmat[i])
        id = id[1:kNN+1]
        id = list(id)



        node = {"index": i, "links": id, "label": labels[i], "title": labels[i], "level":2,
                "id": i, "score": np.sum(Afn[i,id]) }
        nodes.append(node)


        for j in range(0,len(id)):
            link = {"source": i, "target": id[j], "weight": 1-dmat[i,id[j]]/np.max(dmat)}
            links.append(link)

    network = {"nodes": nodes, "links": links}

    return network


period = interval2days(interval)
kNN = 10
myapp.vars={}


secL = ['Non-Energy Minerals','Producer Manufacturing','Electronic Technology','Consumer Durables',
        'Energy Minerals', 'Process Industries','Health Technology', 'Consumer Non-Durables',
        'Industrial Services', 'Commercial Services', 'Distribution Services', 'Technology Services',
        'Health Services', 'Consumer Services', 'Retail Trade', 'Transportation', 'Utilities',
        'Finance', 'Communications', 'Miscellaneous', 'Government', 'Not Classified']

secL2 = {'Non-Energy Minerals':1100,
         'Producer Manufacturing':1200,'Electronic Technology':1300,'Consumer Durables':1400,
        'Energy Minerals':2100,'Process Industries':2200,'Health Technology':2300,'Consumer Non-Durables':2400,
        'Industrial Services':3100,'Commercial Services':3200,'Distribution Services':3250,'Technology Services':3300,
        'Health Services':3350,'Consumer Services':3400,'Retail Trade':3500,'Transportation':4600,
        'Utilities':4700,'Finance':4800,'Communications':4900,'Miscellaneous':6000,'Government':7000,'Not Classified':9999,
         }


mycolors = ['#485fd1', '#5572df','#6384eb','#7295f4','#81a4fb','#90b2fe', '#9fbfff', '#afcafc',
            '#bed2f6','#cbd8ee','#d7dce3','#e2dad5','#ecd3c5','#f2c9b4','#f6bda2','#f7ad90',
            '#f59d7e','#f08b6e', '#e9785d','#df634e','#d24b40','#c43032']

@myapp.route('/home',methods=['GET','POST'])
def home():
    global inputSnP
    input=arr2json(inputSnP)

    return render_template('tabmenu.html',num=input)


@myapp.route('/_update')
def update():

    global interval, period, datapr, datatot, secL, secL2, nameID, tickers, inputSnP, universe,future

    #input=arr2json(inputSnP)

    future = 0
    start_to = request.args.get('start_to', 0, type=float)
    end_to   = request.args.get('end_to', 0, type=float)
    interval=[start_to,end_to]
    period = interval2days(interval)

    # GET UNIVERSE
    data = datatot[period,:]
    id  = selectStocks(data) # vlist2[period[future-1]]

    # MAKE SURE THE LONG AND SHORT PORTFOLIOS are in the Universe
    idL = np.where(ave_vlist2[future-1]!=0)
    idL = idL[0]
    universe = np.union1d(id,idL)


    idS = np.where(ave_vlist3[future-1]!=0)
    idS=idS[0]
    universe = np.union1d(universe,idS)


    # GRAPH EXPLORER
    data = data[:,universe]
    data[np.isnan(data)]=0.0

    data = data-np.nanmean(data,axis=1).reshape([data.shape[0],1])

    aff = affinity.correlation(data)

    Vecs,Vals = markov.markov_eigs(aff,n_eigs=20)

    dmat = diffusion_mat(vecs=Vecs, vals=Vals, dtime =1/(1-Vals[1]))

    Idx  = dmat.argsort(axis=1)

    #name = [nameID[i] for i in id]

    tic = [tickers[i] for i in universe]

    #network = buildNetwork(aff,dmat,labels=tic, kNN=kNN)

    # SCATTER PLOT
    ret = 100*(np.prod(1+data/100,axis=0)-1.0)

    myNetwork = myNetworkScatter(aff, dmat, Vecs, Vals, dtime=0.0, n1=2, n2=3, ret=ret, label=tic,kNN=kNN)

    # PIE CHART
    wsecL, wsecS, wsecLshadow, wsecSshadow, wsecBench, retsecL, retsecS, retsecLshadow, \
    retsecSshadow, retsecBench = get_piecharts(future=0, Idx=Idx, knn=kNN)


    #result_len = (end_to-start_to)/(24.0*1000.0*3600)
    return jsonify(
        #result_len = result_len,
        #num=input,
        wsecL=wsecL,
        wsecLshadow=wsecLshadow,
        wsecS=wsecS,
        wsecSshadow=wsecSshadow,
        retsecL=retsecL,
        retsecLShadow=retsecLshadow,
        retsecS=retsecS,
        retsecSshadow=retsecSshadow,
        retsecBench=retsecBench,
        interval=interval,
        network=myNetwork,
        )

@myapp.route('/')
def main():
    return redirect('/home')

if __name__ == "__main__":
    myapp.run(port=5000)


