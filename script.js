
const SUPABASE_URL = "https://iuqqzyodwhgriapbmkdd.supabase.co";
const SUPABASE_KEY = "sb_publishable__3RADRILI656wRQXYWiw7g_ZSY4iqUJ";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
function convertTo24HourTime(time12h) {
    const match = time12h.trim().match(
        /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );

    if (!match) return null;

    let hours = Number(match[1]);
    const minutes = match[2];
    const period = match[3].toUpperCase();

    if (hours < 1 || hours > 12) return null;

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${minutes}`;
}
async function loadAirports() {
    const airportSelect = document.getElementById("airport");

    if (!airportSelect) return;

    airportSelect.innerHTML =
        '<option value="">Loading airports...</option>';

    const { data, error } = await supabaseClient
        .from("airports")
        .select("airport_name, airport_code")
        .eq("is_active", true)
        .order("airport_name");

    if (error) {
        console.error("Airport loading error:", error);
        airportSelect.innerHTML =
            '<option value="">Unable to load airports</option>';
        return;
    }

    airportSelect.innerHTML =
        '<option value="">Select airport</option>';

    data.forEach((airport) => {
        const option = document.createElement("option");
        option.value = airport.airport_code;
        option.textContent = airport.airport_name;
        airportSelect.appendChild(option);
    });
        new TomSelect("#airport", {
        create: false,
        searchField: ["text", "value"],
        placeholder: "Search airport or airport code...",
        maxOptions: 100
    });
}

document.addEventListener("DOMContentLoaded", loadAirports);
const registrationForm = document.getElementById("registrationForm");

if (registrationForm) {
    registrationForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const submitButton = registrationForm.querySelector("button[type='submit']");
        const message = document.getElementById("formMessage");

        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
        message.textContent = "";

        const formData = new FormData(registrationForm);
        const selectedTime = formData.get("travelTime");
        const convertedTime = convertTo24HourTime(selectedTime);

if (!convertedTime) {
    message.textContent = "Please enter a valid time, such as 08:30 PM.";
    submitButton.disabled = false;
    submitButton.textContent = "Submit Registration";
    return;
}

        const registration = {
            full_name: formData.get("fullName").trim(),
            email: formData.get("email").trim(),
            phone: formData.get("phone").trim(),
            airport: formData.get("airport"),
            airport_code: formData.get("airport"),
            destination: formData.get("destination").trim(),
            travel_date: formData.get("travelDate"),
            travel_time: convertedTime,
            passengers: Number(formData.get("passengers")),
            shared_interest: formData.get("interest"),
            consent: registrationForm.querySelector(
                "input[type='checkbox']"
            ).checked
        };

        try {const turnstileToken = window.turnstile?.getResponse();

if (!turnstileToken) {
    throw new Error("Please complete the security check.");
}

const { data, error } = await supabaseClient.functions.invoke(
    "submit-ride-request",
    {
        body: {
            passenger_name: registration.full_name,
            phone: registration.phone,
            airport_code: registration.airport_code,
            destination: registration.destination,
            travel_date: registration.travel_date,
            travel_time: registration.travel_time,
            passengers: registration.passengers,
            consent: registration.consent,
            turnstile_token: turnstileToken
        }
    }
);

if (error) throw error;
if (data?.error) throw new Error(data.error);

message.textContent = "Your FlyShare ride request has been received.";

registrationForm.reset();
window.turnstile?.reset();
        } catch (error) {
            console.error("Registration error:", error);
            message.textContent =
                "Registration failed. Please try again later.";
            window.turnstile?.reset();    
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Submit Interest →";
        }
    });
}
