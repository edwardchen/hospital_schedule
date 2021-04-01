today = new Date();
currentMonth = today.getMonth();
currentYear = today.getFullYear();

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

monthAndYear = document.getElementById("monthAndYear");
let weeks = [];
let all = {};
let dateAssignments = {};
createCalArray(currentMonth, currentYear);


const fileSelector = document.getElementById('file-selector');
fileSelector.addEventListener('change', (event) => {
  const file = event.target.files[0];


  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    processData(event.target.result.replace(/\r/g, "\n"));
  });
  reader.readAsText(file);
});

function createCalArray(month, year) {

  let firstDay = (new Date(year, month)).getDay();

  let date = 1;
  for (let i = 0; i < 6; i++) {
    let row = [];

    for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          row.push(null);
        } else if (date > daysInMonth(month, year)) {
          break;
        } else {
          row.push(date);
          date++;
        }
    }

    weeks.push(row); // appending each row into calendar body.
  }
}

function showCalendar(month, year) {

    tbl = document.getElementById("calendar-body"); // body of the calendar

    // clearing all previous cells
    tbl.innerHTML = "";

    // filing data about month and in the page via DOM.
    monthAndYear.innerHTML = months[month] + " " + year;

    for (let i = 0; i < 6; i++) {
        // creates a table row
        let row = document.createElement("tr");

        //creating individual cells, filing them up with data.
        for (let j = 0; j < 7; j++) {
            if(weeks[i][j] === undefined) {

            } else if (i === 0 && weeks[i][j] === null) {
                cell = document.createElement("td");
                dateEl = document.createElement("div");
                dateEl.classList.add("date");
                cellText = document.createTextNode("");
                dateEl.appendChild(cellText);
                cell.appendChild(cellText);
                row.appendChild(cell);
            }
            else if (weeks[i][j] > daysInMonth(month, year)) {
                break;
            }

            else {
                cell = document.createElement("td");
                dateEl = document.createElement("div");
                dateEl.classList.add("date");
                cellText = document.createTextNode(weeks[i][j]);
                cell.setAttribute("id", weeks[i][j]);
                if (weeks[i][j] === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                    cell.classList.add("bg-info");
                } // color today's date
                dateEl.appendChild(cellText);
                cell.appendChild(dateEl);

                // add assignments
                if(dateAssignments[weeks[i][j]] !== undefined && dateAssignments[weeks[i][j]].assigned) {
                  for(assignment in dateAssignments[weeks[i][j]].assigned) {
                    const nameEl = document.createElement("div");

                    nameEl.classList.add("assigned");
                    const nameText = document.createTextNode(dateAssignments[weeks[i][j]].assigned[assignment]);
                    nameEl.appendChild(nameText);
                    cell.appendChild(nameEl);
                  }
                }

                // add holidays
                if(dateAssignments[weeks[i][j]] !== undefined && dateAssignments[weeks[i][j]].holiday) {
                  for(assignment in dateAssignments[weeks[i][j]].holiday) {
                    const nameEl = document.createElement("div");

                    nameEl.classList.add("holiday");
                    const nameText = document.createTextNode(dateAssignments[weeks[i][j]].holiday[assignment]);
                    nameEl.appendChild(nameText);
                    cell.appendChild(nameEl);
                  }
                }

                // add vacation
                if(dateAssignments[weeks[i][j]] !== undefined && dateAssignments[weeks[i][j]].vacation) {
                  for(assignment in dateAssignments[weeks[i][j]].vacation) {
                    const nameEl = document.createElement("div");

                    nameEl.classList.add("vacation");
                    const nameText = document.createTextNode(dateAssignments[weeks[i][j]].vacation[assignment]);
                    nameEl.appendChild(nameText);
                    cell.appendChild(nameEl);
                  }
                }

                row.appendChild(cell);
            }


        }

        tbl.appendChild(row); // appending each row into calendar body.
    }

}


// check how many days in a month code from https://dzone.com/articles/determining-number-days-month
function daysInMonth(iMonth, iYear) {
    return 32 - new Date(iYear, iMonth, 32).getDate();
}

function isWeekend() {

}


function isEligible(candidate, year, month, date) {
  // all eligible

  // check not assigned day before
  if(date > 1 && dateAssignments[date-1].assigned.includes(candidate)) {
    return false;
  }

  // check not on holiday
  if(all[candidate].holiday.includes(new Date(year, month-1, date).toDateString())) {
    return false;
  }

  // check not on vacation
  if(all[candidate].vacation.includes(new Date(year, month-1, date).toDateString())) {
    return false;
  }

  // check not on weekend before or after holiday

  // remaining eligible
  return true;
}

function assignDates(numAssigned, month, year) {
  let foundPerson = false;

  for(date = 1; date <= daysInMonth(month, year); date++) {
    let nameList = Object.keys(all);
    let candidate = false;

    if(dateAssignments[date] == undefined) {
      dateAssignments[date] = {}
    }
    if(dateAssignments[date].assigned == undefined) {
      dateAssignments[date].assigned = []
    }

    while (dateAssignments[date].assigned.length < numAssigned) {
      while(!foundPerson) {
        let index = Math.floor(Math.random() * nameList.length);
        candidate = nameList[index];
        if(isEligible(candidate, year, month, date)) {
          foundPerson = true;
        }
        nameList.splice(index, 1);
        if (nameList.length == 0 && foundPerson == false) {
          alert('no valid schedule found');
        }
      }

      dateAssignments[date].assigned.push(candidate);
      foundPerson = false;
    }
  }
  console.log(dateAssignments);
}

function processData(allText) {
  var record_num = 3;  // or however many elements there are in each row
  var allTextLines = allText.split(/\r\n|\n/);
  var monthYear = allTextLines[0].split('-');
  var numAssigned = allTextLines[1];
  var month = monthYear[0];
  var year = monthYear[1];

  for (var i=2; i < allTextLines.length; i++) {
    var entries = allTextLines[i].split(',');

    var lines = [];

    while (entries.length==3) {
      var name;
      var tarr = [];
      var tarr2 = [];

      for (var j=0; j<record_num; j++) {
        if(j == 0) {
           name = entries.shift();
        } else if (j == 1) {
          var entry = entries.shift();
          if (entry !== undefined) {
            var dates = entry.split(' ');

            for (k in dates) {
              if(dates[k] !== '') {
                tarr.push(new Date(year, month-1, dates[k]).toDateString());
                if(dateAssignments[dates[k]] === undefined) {
                  dateAssignments[dates[k]] = {};
                }
                if(dateAssignments[dates[k]].holiday === undefined) {
                  dateAssignments[dates[k]].holiday = [name]
                } else {
                  dateAssignments[dates[k]].holiday.push(name)
                }
              }
            }

          }
        } else if (j == 2) {
          var entry = entries.shift();
          if (entry !== undefined) {
            var dates = entry.split(' ');

            for (k in dates) {
              if(dates[k] !== '') {
                tarr2.push(new Date(year, month-1, dates[k]).toDateString());
                if(dateAssignments[dates[k]] === undefined) {
                  dateAssignments[dates[k]] = {};
                }
                if(dateAssignments[dates[k]].vacation === undefined) {
                  dateAssignments[dates[k]].vacation = [name]
                } else {
                  dateAssignments[dates[k]].vacation.push(name)
                }
              }
            }
          }
        }
      }

      all[name] = {};
      all[name].vacation = tarr;
      all[name].holiday = tarr2;
    }
  }


  assignDates(numAssigned, month, year);
  showCalendar(month, year);
}
