import React from "react";

// Placeholder for chart components (replace with real chart libs if needed)
const PieChart = () => (
  <div style={{ width: 150, height: 150, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#333', margin: '0 auto' }}>
    100 / 200
  </div>
);
const BarChart = () => (
  <div style={{ width: '100%', height: 120, background: '#f9f9f9', display: 'flex', alignItems: 'flex-end', gap: 8, padding: 8 }}>
    {[180, 160, 140, 120, 60].map((h, i) => (
      <div key={i} style={{ width: 30, height: h / 2, background: ['#4f8cff', '#4f8cff', '#ffb347', '#4caf50', '#4caf50'][i], borderRadius: 4 }} />
    ))}
  </div>
);

export default function PracticeDashboard() {
  return (
    <div style={{ fontFamily: 'inherit', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24, margin: '24px 0' }}>
      {/* Today's Goal & Practice Session */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <div style={{ flex: 1, background: '#fafafa', borderRadius: 8, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#ffb347' }}>0 / 100</div>
          <div style={{ fontSize: 14, color: '#888' }}>Questions</div>
        </div>
        <div style={{ flex: 1, background: '#fafafa', borderRadius: 8, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#4f8cff' }}>0 Days</div>
          <div style={{ fontSize: 14, color: '#888' }}>current streak</div>
        </div>
        <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ background: '#eaf3ff', borderRadius: 8, padding: 12, fontWeight: 500, color: '#2d5fa7' }}>
            Score Booster <span style={{ background: '#ffb347', color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 12, marginLeft: 8 }}>New</span>
            <div style={{ fontSize: 12, color: '#666', fontWeight: 400 }}>Smart prep designed to raise your NEET score.</div>
          </div>
          <div style={{ background: '#fffbe6', borderRadius: 8, padding: 12, fontWeight: 500, color: '#a67c00' }}>
            Custom Practice Session <span style={{ fontSize: 12, color: '#888', fontWeight: 400 }}>1 Free remaining for the day</span>
          </div>
          <div style={{ background: '#e6f7fa', borderRadius: 8, padding: 12, fontWeight: 500, color: '#008080' }}>
            Generate Revision <span style={{ fontSize: 12, color: '#888', fontWeight: 400 }}>Practicing at least 20 questions is required for a Revision session to be available.</span>
          </div>
        </div>
      </div>

      {/* Question Practice Tracker */}
      <div style={{ background: '#f6f8fa', borderRadius: 8, padding: 20, marginBottom: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Your Question Practice Tracker</div>
        <div style={{ background: '#fffbe6', color: '#a67c00', borderRadius: 4, padding: 8, fontSize: 13, marginBottom: 16 }}>
          Displaying SAMPLE DATA as no recent question practice data found. Start practicing questions to see your data. The data is refreshed daily.
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Current Week's Progress*</div>
            <PieChart />
            <div style={{ textAlign: 'center', fontSize: 13, color: '#888', marginTop: 8 }}>
              Start by solving at least 200 questions weekly
            </div>
          </div>
          <div style={{ flex: 2 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Recent Weeks' Progress*</div>
            <BarChart />
            <div style={{ textAlign: 'center', fontSize: 13, color: '#888', marginTop: 8 }}>
              Increase your weekly count of question attempts to improve score.
            </div>
          </div>
        </div>
      </div>

      {/* Performance Snapshot, Target, Revision, Courses */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ background: '#fafafa', borderRadius: 8, padding: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Performance Snapshot</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 500 }}>Your Performance Report</div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
              Based on your question practice history, you can see your overall predicted NEET score and chapterwise details. As you improve your question solving skills, you improve your predicted NEET score. If you have not practiced enough questions in each subject, then the prediction will be inaccurate.
            </div>
            <button style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}>View Report</button>
          </div>
        </div>
        <div style={{ background: '#fafafa', borderRadius: 8, padding: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>My Target</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 500 }}>No Active Target</div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
              If you haven't created a target yet, you can do so by clicking the button below
            </div>
            <button style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 500, cursor: 'pointer', marginRight: 8 }}>Set Target</button>
            <button style={{ background: '#eaf3ff', color: '#2d5fa7', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}>Past Target Details</button>
          </div>
        </div>
        <div style={{ background: '#fafafa', borderRadius: 8, padding: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>My Revision</div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
            Regular revision is a critical component of your preparation. However, it often gets ignored in preparation. In your target, please set aside minimum 30 minutes for daily revision. Please revise each chapter using chapter revision as that is important before target test.
          </div>
          <button style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 500, cursor: 'pointer', marginRight: 8 }}>Daily Revision</button>
          <button style={{ background: '#ffb347', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}>Chapter Revision</button>
        </div>
        <div style={{ background: '#fafafa', borderRadius: 8, padding: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>My Courses</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src="https://dummyimage.com/120x80/eee/aaa&text=NEET+Course" alt="NEET Course" style={{ borderRadius: 8, width: 120, height: 80, objectFit: 'cover' }} />
            <div>
              <div style={{ fontWeight: 500 }}>NEET Course - 10 Chapters (Trial Course)</div>
              <button style={{ background: '#eaf3ff', color: '#2d5fa7', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 500, cursor: 'pointer', marginTop: 8 }}>Go to Course</button>
            </div>
          </div>
          <button style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 500, cursor: 'pointer', marginTop: 16, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>VIEW ALL COURSES</button>
        </div>
      </div>
    </div>
  );
} 