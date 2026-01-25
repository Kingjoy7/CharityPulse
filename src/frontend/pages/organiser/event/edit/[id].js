import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";

export default function EditEventPage() {
  const router = useRouter();
  const { id } = router.query;

  const { token } = useAuth(); 

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetGoal, setTargetGoal] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/events/${id}`);
        if (!res.ok) throw new Error("Failed to fetch event");

        const data = await res.json();

        setTitle(data.title);
        setDescription(data.description);
        setTargetGoal(data.targetGoal);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:5001/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          title,
          description,
          targetGoal,
        }),
      });

      if (!res.ok) throw new Error("Failed to update event");

      alert("Event updated successfully!");
      router.push("/organiser/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  if (error) return <p>Error: {error}</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Edit Event</h1>

      <form style={styles.form} onSubmit={handleSubmit}>
        <label style={styles.label}>Title</label>
        <input
          type="text"
          style={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label style={styles.label}>Description</label>
        <textarea
          style={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />

        <label style={styles.label}>Target Goal ($)</label>
        <input
          type="number"
          style={styles.input}
          value={targetGoal}
          onChange={(e) => setTargetGoal(e.target.value)}
          required
        />

        <button type="submit" style={styles.button}>
          Save Changes
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "25px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "25px",
    fontSize: "32px",
    fontWeight: "700",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  label: {
    fontSize: "16px",
    fontWeight: "600",
  },
  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  textarea: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    marginTop: "10px",
    backgroundColor: "#0070f3",
    color: "#fff",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    fontSize: "18px",
    cursor: "pointer",
    fontWeight: "600",
  },
};
