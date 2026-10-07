import { useState } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function MiniCalendar({ reportDates, selectedDate, onSelectDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button type="button" className="calendar-nav-btn" onClick={goToPrevMonth} aria-label="이전 달">
          ‹
        </button>
        <span className="calendar-title">
          {viewYear}년 {viewMonth + 1}월
        </span>
        <button type="button" className="calendar-nav-btn" onClick={goToNextMonth} aria-label="다음 달">
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((day, i) => {
          if (day === null) return <span key={`empty-${i}`} className="calendar-cell" />;

          const key = toDateKey(viewYear, viewMonth, day);
          const hasReports = reportDates.has(key);
          const isSelected = key === selectedDate;
          const isToday = key === todayKey;

          return (
            <button
              type="button"
              key={key}
              className={`calendar-cell calendar-day${isToday ? " today" : ""}${
                isSelected ? " selected" : ""
              }${hasReports ? " has-reports" : ""}`}
              onClick={() => onSelectDate(isSelected ? null : key)}
            >
              {day}
              {hasReports && <span className="calendar-dot" />}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <button type="button" className="calendar-clear" onClick={() => onSelectDate(null)}>
          날짜 선택 해제
        </button>
      )}
    </div>
  );
}
