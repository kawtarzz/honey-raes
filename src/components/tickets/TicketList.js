import { useEffect, useState } from "react"
import "./Tickets.css"
import { useNavigate } from "react-router-dom"

export const TicketList = ({ searchTermState }) => {
    // tickets holds an empty array, set tickets is our function, use state lets us view array in current state
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFiltered] = useState([]);
    const [emergency, setEmergency] = useState(false);
    const [openOnly, updateOpenOnly] = useState(false);
    const navigate = useNavigate()

    const localHoneyUser = localStorage.getItem("honey_user");
    const honeyUserObject = JSON.parse(localHoneyUser);

    useEffect(() => {
        if (emergency) {
            const emergencyTickets = tickets.filter(ticket =>
                ticket.emergency === true)

            setFiltered(emergencyTickets)
        } else {
            setFiltered(tickets);
        }
    }, [emergency]
    );

    useEffect(
        () => {
            fetch(`http://localhost:8088/serviceTickets`)
                .then(response => response.json())
                .then((tickets) => {
                    setTickets(tickets)
                });
        },
        [] // When this array is empty, you are observing initial component state
    );

    useEffect(() => {
        const openTicketArray = tickets.filter(ticket => {
            return ticket.userId === honeyUserObject.id && ticket.dateCompleted !== ""
        });
        setFiltered(openTicketArray);
    }, [openOnly]
    );

    useEffect(() => {
        if (honeyUserObject.staff === false) {
            const myTickets = tickets.filter(ticket => ticket.userId === honeyUserObject.id)
            setFiltered(myTickets)
            } else {
                setFiltered(tickets)
            }
        }, [tickets]
    );

    return (
        <>
            {honeyUserObject.staff ? (
                <>
                    <button onClick={() => setEmergency(true)}>Emergency Only</button>
                    <button onClick={() => setEmergency(false)}>Show All</button>
                    <button onClick={() => updateOpenOnly(true)}>Open Ticket</button>
                </>
            )
                : (<><button onClick={() => navigate("/ticket/create")}>Create Ticket</button>
                    <button onClick={() => setFiltered(filteredTickets)}>My Tickets</button>
                </>)
            }
            <h2>List of Tickets</h2>
            <article className="tickets">
                {
                    filteredTickets.map(
                        ticket => {
                            return <section className="ticket" key={`ticket--${ticket.id}`}>
                                <header> {ticket.description}</header>
                                <footer>
                                    Emergency: {ticket.emergency ? "🧨" : "No"}
                                </footer>
                            </section> 

                        }
                    )
                }
            </article>
        </>)
}


export const handleSaveButtonClick = (ticket) => {
    const newTicketObject = [{
        userId: ticket.userId,
        description: ticket.description,
        emergency: ticket.emergency,
        dateCompleted: ticket.dateCompleted
    }]
    return fetch("http://localhost:8088/serviceTickets", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newTicketObject)
    })
        .then(response => response.json())
        .then(() => {
            const navigate = useNavigate()
            navigate("/tickets")
        })
}

