
const addBtn = document.querySelector('.add-btn')
const removeBtn = document.querySelector('.remove-btn')
const modalCont = document.querySelector('.modal-container')
const textArea = document.querySelector('.text-area')
const mainCont = document.querySelector('.ticket-main-container')
const allPriorityColors = document.querySelectorAll('.priority-color')
const toolboxColors = document.querySelectorAll('.color-box')

const lockClose = 'fa-lock'
const lockOpen = 'fa-lock-open'
let taskColor = 'lightpink' // initialinzing the task color and declaring it as global variable
let colors = ['lightpink', 'lightgreen', 'lightblue', 'black' ] // used to change the ticket priority while clicking on the colorband

let addFlag = false
let removebtnFlag = false
let addbtnFlag = false



// updating from local storage after every refresh or reload
let ticketsarr = JSON.parse(localStorage.getItem('tickets'))||[]

function initialize(){
    if(localStorage.getItem('tickets')){
        ticketsarr.forEach(function(ticket){
            createTicket(ticket.TicketColor, ticket.id, ticket.task)
        })
    }
}
initialize(); // calling to create function after reload






// adding the modal pop up when add button is clicked
addBtn.addEventListener('click', function(){
    addFlag = !addFlag;
    if(addFlag) modalCont.style.display = 'flex'
    else modalCont.style.display = 'none'
})



// TICKET MANIPULATIONS :

//filtering of tickets using filter colors
    toolboxColors.forEach(function(eachColor){
        eachColor.addEventListener('click',function(){
            const allTickets = document.querySelectorAll('.ticket-container');
            const selectedColor = eachColor.classList[0];

            allTickets.forEach(function(ticket){
                const ticketColorband = ticket.querySelector('.ticket-color')
                if(ticketColorband.style.backgroundColor == selectedColor){
                    ticket.style.display = "block"
                }
                else {ticket.style.display = "none"}
            })
        })
        // double click should display all the tickets 
        eachColor.addEventListener('dblclick', function(){
            const allTickets = document.querySelectorAll('.ticket-container')
            allTickets.forEach(function(ticket){
                ticket.style.display = 'block'
            })
        })
    })


// handling the locks in tickets
function handlelock(ticket){
    const ticketId = ticket.querySelector('.ticket-id').innerText // for updating to local storage

    const ticketLockele = ticket.querySelector('.ticket-lock')
    const taskarea = ticket.querySelector('.ticket-area')
    // the <i> tag only has the icon's class we need to change, i tag is child of the ticket-lock class
    // so if we select a parent and access the childrens of it using .children method they are also indexed
    const ticketlockicon = ticketLockele.children[0]

    ticketlockicon.addEventListener('click', function(){
        if(ticketlockicon.classList.contains(lockClose)){
            ticketlockicon.classList.remove(lockClose)
            ticketlockicon.classList.add(lockOpen)
            taskarea.setAttribute('contenteditable', 'true')  
        }
        else{
            ticketlockicon.classList.remove(lockOpen)
            ticketlockicon.classList.add(lockClose)
            taskarea.setAttribute('contenteditable', 'false')
        }
        // updating to local storage 
        const ticketIdx = getidx(ticketId)
        ticketsarr[ticketIdx].task = taskarea.innerText
        updatelocalstorage()
    })
    
}

// changing priority while clicking on the colorband
function handlecolors(ticket){
    const ticketColorband = ticket.querySelector('.ticket-color')
    const ticketId = ticket.querySelector('.ticket-id').innerText //to update to local storage using id
    ticketColorband.addEventListener('click',function(){
        const currcolor = ticketColorband.style.backgroundColor; // getting the current background color
        // to find the index of an element in an array we have a direct method -> findIndex
        let currcolorindx = colors.findIndex(function(x){
            return currcolor == x;
        })

        currcolorindx++ // increment the current color's index
        // but in this array there are only 4 elements so after 3rd index it should go to 0th index again
        // we can use a a trick to keep the array in cycle 
        // modulus by the length of the array can make the array indexx to got to 0 whenever it reaches the last ele

        const newcolorindx = currcolorindx % colors.length;
        const newcolor = colors[newcolorindx];
        ticketColorband.style.backgroundColor = newcolor;

        //updating to local storage
        const ticketIdx = getidx(ticketId)
        ticketsarr[ticketIdx].TicketColor = newcolor;
        updatelocalstorage()
    })
}

// ticket removal
removeBtn.addEventListener('click',function(){
    removebtnFlag = !removebtnFlag // toggling the current state
    if(removebtnFlag){  // if remove btn is true (activated)
        alert('Delete button active!!   Click on the tasks you want to delete.')
        removeBtn.style.color = 'red'
    }
    else{
        removeBtn.style.color = 'white'
    }
})

//handle removal
function handleremoval(ticket){
    ticket.addEventListener('click', function(){
        const ticketId = ticket.querySelector('.ticket-id').innerText;
         if(removebtnFlag) {
            ticket.remove()
            const ticketIdx = getidx(ticketId)
            ticketsarr.splice(ticketIdx, 1) // removes 1 element at index ticketIdx
            updatelocalstorage()
        } 
        else return;
    })
}


// generating a ticket
function createTicket(color, id, task){
    const ticketCont = document.createElement('div')
    ticketCont.setAttribute('class', 'ticket-container')
    ticketCont.innerHTML = `<div class="ticket-color" style="background-color:${color}"></div>
            <div class="ticket-id">${id}</div>
            <div class="ticket-area">${task}</div>
            <div class="ticket-lock">
            <i class="fa-solid fa-lock"></i>
            </div>`
    // append to main container
    mainCont.appendChild(ticketCont)
    handlecolors(ticketCont) // it is attached to the create ticket such that all the tickets has this prop  
    handlelock(ticketCont)
    handleremoval(ticketCont)
    // all of the lements created inside a function has access to the function that are called inside the same function
    // like in this fn all tickets created has an access to the function which are called inside the function
}

// MODAL POP UP MANIPULATIONS AND TRIGGERING TICKET GENERATION

// Adding key event on the modal cont
modalCont.addEventListener('keydown', function(e){
        if(e.key == 'Shift'){
            const task = textArea.value;
            const id = (Math.random()*1000).toFixed(0)
            createTicket(taskColor, id, task);
            // now we have to display: none the modal pop up after generating a ticket
            // but we should not only change the style property
            // also change the addFlag to false, for the addbtn to work properly
            modalCont.style.display = 'none'
            addFlag = false;
            ticketsarr.push({ TicketColor: taskColor, id, task});
            updatelocalstorage()    
        }
    });

// adding border while selecting the color of the task in modal pop up
allPriorityColors.forEach(function(colorElem){
    colorElem.addEventListener('click', function(e){
        // first remove the border for previous color
        // for that we are removing active clas for all the color elements
        allPriorityColors.forEach(function(ele){
            ele.classList.remove('active')
        })
        // now add active class to the current ele
        colorElem.classList.add('active')
        // attaching the color to the ticket strip 
        //we are getting it from the class list of the cuurent colorele
        taskColor = colorElem.classList[0]
    })
})



// UPDATING TO LOCAL STORAGE

function updatelocalstorage(){
    localStorage.setItem('tickets', JSON.stringify(ticketsarr))
}

// finding index using id of ticket
function getidx(id){
    const ticketIdx = ticketsarr.findIndex(function(ticket){
        return ticket.id == id
    })
    return ticketIdx;
}
