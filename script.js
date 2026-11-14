
const SUPABASE_URL = "https://iuqqzyodwhgriapbmkdd.supabase.co"
const SUPABASE_KEY = "sb_publishable__3RADRILI656wRQXYWiw7g_ZSY4iqUJ"

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

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

        const registration = {
            full_name: formData.get("fullName").trim(),
            email: formData.get("email").trim(),
            phone: formData.get("phone").trim(),
            airport: formData.get("airport"),
            destination: formData.get("destination").trim(),
            travel_date: formData.get("travelDate"),
            passengers: Number(formData.get("passengers")),
            shared_interest: formData.get("interest"),
            consent: registrationForm.querySelector(
                "input[type='checkbox']"
            ).checked
        };

        try {
            const { error } = await supabaseClient
                .from("passenger_registrations")
                .insert([registration]);

            if (error) throw error;

            message.textContent =
                "Thank you! Your early-access interest has been registered.";

            registrationForm.reset();

        } catch (error) {
            console.error("Registration error:", error);
            message.textContent =
                "Registration failed. Please try again later.";
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Submit Interest →";
        }
    });
}
