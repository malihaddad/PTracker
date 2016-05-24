% SCRIPT TO REDUCE SIZE OF THE DATASET BY KEEPING ONLY THE USEFULL ONES.

clear
load dataPAT

universe=[];
for i=1:length(vlist2)
    universe=union(universe,vlist2(i).list);
end

% rename the labels

datatot = datatot(:,universe);
datavol = datavol(:,universe);
datarawpr = datarawpr(:,universe);

nameID = nameID(universe);
sdata = sdata(universe);
tickers = tickers(universe);
upermID = upermID(universe);

% now vlist2,3 ave_vlist23

for i=1:length(vlist2)
    
    fi = vlist2(i).list;
    
    [~,~,ib]=intersect(fi,universe,'stable');
    vlist2(i).list = ib;
    vlist3(i).list = ib;
    
    w2 = ave_vlist2(i).weights;
    w3 = ave_vlist3(i).weights;
    
    idL = find(w2~=0);
    idS = find(w3~=0);
    
    [~,~,ib]=intersect(idL,universe,'stable');
    w2new = zeros(1,length(universe));
    w2new(ib) = w2(idL);
    
    [~,~,ib]=intersect(idS,universe,'stable');
    w3new = zeros(1,length(universe));
    w3new(ib) = w3(idS);
    
    ave_vlist2(i).weights = w2new;
    ave_vlist3(i).weights = w3new;
end

clear i fi ib w2 w3 w2new w3new idL idS
    
    