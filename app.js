console.log("My Personal Assistant loaded");

// Basit bakiye ve harcama sistemi
let balance = 2700;

function addTx(amount, type){
    if(type === "income") balance += amount;
    else balance -= amount;
    console.log("Yeni bakiye:", balance);
}

// Örnek: addTx(150, "expense");