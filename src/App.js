import DayPicker, { DateUtils } from "react-day-picker";
import React, { useEffect } from "react";
import "react-day-picker/lib/style.css";
import "./styles.css";
import { WEEKDAYS_SHORT, MONTHS } from "./types";
import EventDiv from "./components/EventDiv";

function App() {
  const [state, setState] = React.useState(getInitialState());

  function getPosts() {
    var searchParams = new URLSearchParams();
    searchParams.append("from", state.range.from);
    searchParams.append("to", state.range.to);
    //console.log(searchParams);
    fetch(
      "https://russoft.org/wp-content/plugins/react-calendar/api.php?action=get_events&" +
        searchParams
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("fetch data: ", data);

        setState((prevState) => ({
          ...prevState,
          events: data
        }));
      });
  }

  useEffect(() => {
    //console.log("did mount", state);
    getPosts();
  }, []);

  function getInitialState() {
    return {
      range: { from: null, to: null },
      enteredTo: null,
      events: [],
      select: { type: "", period: "" }
    };
  }
  function isSelectingFirstDay(from, to, day) {
    const isBeforeFirstDay = from && DateUtils.isDayBefore(day, from);
    const isRangeSelected = from && to;
    //console.log("isBeforeFirstDay:", isBeforeFirstDay);
    //console.log("from:", from);
    return !from || isBeforeFirstDay || isRangeSelected;
  }

  //////////////////////////////////////////////////////////////////////////////
  function handleDayClick(day) {
    const { from, to } = state.range;
    if (from < to) {
      handleResetClick();
      return;
    }
    if (from && to && day >= from && day <= to) {
      handleResetClick();
      return;
    }
    if (isSelectingFirstDay(from, to, day)) {
      // first click
      //console.log(day);
      //day = new Date(day.setHours(0));
      //console.log(day);
      //return;
      console.log("first day");
      console.log(typeof day);
      setState((prevState) => ({
        ...prevState,
        range: {
          from: new Date(day.setHours(0)),
          to: null
        },
        enteredTo: day,
        select: {
          ...prevState.select,
          period: ""
        }
      }));
    } else {
      //console.log("second click"); // second click
      setState((prevState) => ({
        ...prevState,
        range: {
          ...prevState.range,
          to: new Date(day.setHours(23, 59, 59))
        },
        select: {
          ...prevState.select,
          period: ""
        },
        enteredTo: day
      }));
    }
  }
  ///////////////////////////////////////////////////////////////////////////////

  function handleDayMouseEnter(day) {
    const { from, to } = state.range;
    if (!isSelectingFirstDay(from, to, day)) {
      setState((prevState) => ({
        ...prevState,
        enteredTo: day
      }));
    }
  }

  function handleResetClick() {
    setState((prevState) => ({
      ...prevState,
      range: { from: null, to: null },
      select: { type: "", period: "" }
    }));
    console.log(state);
  }

  function handleSelectType(event) {
    setState((prevState) => ({
      ...prevState,
      select: {
        ...prevState.select,
        type: event.target.value
      }
    }));
  }

  function handleSelectPeriod(event) {
    let from, to;
    let date = new Date();

    switch (event.target.value) {
      ////////////////////////
      case "all-period":
        console.log("all period");

        setState((prevState) => ({
          ...prevState,
          range: { from: null, to: null },
          select: {
            ...prevState,
            period: event.target.value
          },
          enteredTo: null
        }));
        break;
      ///////////////////////
      case "last-week":
        console.log("last-week");
        setState((prevState) => ({
          ...prevState,
          range: {
            from: new Date(date.setHours(0)),
            to: new Date(date.setHours(23, 59, 59))
          },
          select: {
            ...prevState,
            period: event.target.value
          },
          enteredTo: null
        }));
        break;
      //////////////////////
      case "last-month":
        console.log("last-month");
        break;
      //////////////////////
      case "last-half-year":
        console.log("last-half-year");
        break;
      ///////////////////////
      case "last-year":
        console.log("last-year");
        break;
      ///////////////////////
      default:
        console.log("error period");
    }

    setState((prevState) => ({
      ...prevState,
      select: {
        ...prevState.select,
        period: event.target.value
      }
    }));
  }
  const { range, enteredTo } = state;
  //const modifiers = { start: range.from, end: enteredTo };
  const disabledDays = { before: state.range.from };
  const selectedDays = [range.from, { from: range.from, to: enteredTo }]; //o: enteredTo }];

  let highlighted = Object.entries(state.events).map(([k, v], key) => {
    return new Date(v.date);
  });

  const modifiers = {
    weekends: { daysOfWeek: [6, 0] }, // saturday, sunday
    start: range.from,
    end: range.to,
    highlighted: highlighted
  };

  let count = 0;
  let events = [];
  Object.entries(state.events).map(([k, obj], key) => {
    let ev = new Date(obj.date);
    if (
      (ev > state.range.from && ev < state.range.to) ||
      state.range.from == null
    ) {
      events.push(obj);
      count++;
    }
  });
  let listEvents = events.map((v, key) => <EventDiv key={key} event={v} />);
  console.log(state);
  return (
    <div>
      <DayPicker
        className="Range"
        numberOfMonths={2}
        firstDayOfWeek={1}
        fromMonth={range.from}
        selectedDays={selectedDays}
        disabledDays={disabledDays}
        modifiers={modifiers}
        onDayClick={handleDayClick}
        onDayMouseEnter={handleDayMouseEnter}
        months={MONTHS}
        weekdaysShort={WEEKDAYS_SHORT}
      />
      <div>
        <select value={state.select.type} onChange={handleSelectType}>
          <option value="all-events">Все мероприятия</option>
          <option value="russoft-events">Мероприятия РУССОФТ</option>
          <option value="partners-events">Мероприятия партнеров</option>
        </select>

        <select value={state.select.period} onChange={handleSelectPeriod}>
          <option value="all-period">Все мероприятия</option>
          <option value="last-week">За неделю</option>
          <option value="last-month">За месяц</option>
          <option value="last-half-year">За полгода</option>
          <option value="last-year">За год</option>
        </select>

        {/* !range.from && !range.to && "Please select the first day." */}
        {/* range.from && !range.to && "Please select the last day." */}
        {/* range.from &&
          range.to &&
          `Selected from ${range.from.toLocaleDateString()} to
        ${range.to.toLocaleDateString()}` */}
        {range.from && range.to && (
          <button className="link" onClick={handleResetClick}>
            Очистить фильтр
          </button>
        )}
      </div>
      {/*
      <p>
        from: {state.range.from == null ? "null" : state.range.from.toString()}
      </p>
      <p>to: {state.range.to == null ? "null" : state.range.to.toString()}</p>
      <p>
        enteredTo:{" "}
        {state.enteredTo == null ? "null" : state.enteredTo.toString()}
      </p>
      */}
      <div className="counter">{count} мероприятий</div>
      <div className="row row_flex">{listEvents}</div>
    </div>
  );
}

export default App;
