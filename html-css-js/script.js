function addJob(){

let company = document.getElementById("company").value
let role = document.getElementById("role").value

let li = document.createElement("li")

li.innerText = company + " - " + role

document.getElementById("jobList").appendChild(li)

}