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
        //console.log("fetch data: ", data);

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
      // console.log("first day");
      //console.log(typeof day);
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
    //console.log(state);
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
    switch (event.target.value) {
      ////////////////////////
      case "all-period":
        //console.log("all period");

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
        // console.log("last-week");
        // let entered = new Date(new Date().setDate(new Date().getDate() + 7));
        //console.log("log:", entered);
        setState((prevState) => ({
          ...prevState,
          range: {
            from: new Date(new Date().setHours(0)),
            to: new Date(new Date().setDate(new Date().getDate() + 7))
          },
          select: {
            ...prevState,
            period: event.target.value
          },
          enteredTo: new Date(new Date().setDate(new Date().getDate() + 7))
        }));
        break;
      //////////////////////
      case "last-month":
        //console.log("last-month");
        setState((prevState) => ({
          ...prevState,
          range: {
            from: new Date(new Date().setHours(0)),
            to: new Date(new Date().setDate(new Date().getDate() + 31))
          },
          select: {
            ...prevState,
            period: event.target.value
          },
          enteredTo: new Date(new Date().setDate(new Date().getDate() + 31))
        }));
        break;
      //////////////////////
      case "last-half-year":
        //console.log("last-half-year");
        setState((prevState) => ({
          ...prevState,
          range: {
            from: new Date(new Date().setHours(0)),
            to: new Date(new Date().setDate(new Date().getDate() + 180))
          },
          select: {
            ...prevState,
            period: event.target.value
          },
          enteredTo: new Date(new Date().setDate(new Date().getDate() + 180))
        }));
        break;
      ///////////////////////
      case "last-year":
        //console.log("last-year");
        setState((prevState) => ({
          ...prevState,
          range: {
            from: new Date(new Date().setHours(0)),
            to: new Date(new Date().setDate(new Date().getDate() + 365))
          },
          select: {
            ...prevState,
            period: event.target.value
          },
          enteredTo: new Date(new Date().setDate(new Date().getDate() + 365))
        }));
        break;
      ///////////////////////
      default:
      //console.log("error period");
    }
  }
  const { range, enteredTo } = state;
  //const modifiers = { start: range.from, end: enteredTo };
  const disabledDays = { before: state.range.from };
  const selectedDays = [range.from, { from: range.from, to: enteredTo }]; //o: enteredTo }];

  let highlighted = Object.entries(state.events).map(([k, v], key) => {
    if (
      state.select.type === "russoft-events" &&
      Array.isArray(v.category) &&
      v.category.length > 0 &&
      v.category[0].slug !== "russoft-events"
    )
      return null;
    if (
      state.select.type === "partners-events" &&
      Array.isArray(v.category) &&
      v.category.length > 0 &&
      v.category[0].slug !== "partners-events"
    )
      return null;
    return new Date(v.date);
  });

  const modifiers = {
    weekends: { daysOfWeek: [6, 0] }, // saturday, sunday
    start: range.from,
    end: range.to,
    highlighted: highlighted
  };

  // Обьекты в диапазоне дат
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
  // Фильтр наши - не наши мероприятия
  events = events.filter((obj) => {
    //console.log("filter", state.select.type);
    let cat = obj.category;
    switch (state.select.type) {
      case "all-events":
        return true;
      case "russoft-events":
        if (
          Array.isArray(cat) &&
          cat.length > 0 &&
          cat[0].slug !== "russoft-events"
        ) {
          //console.log("Это не РУССОФТ!", cat[0].slug);
          count--;
          return false;
        }

        return 1;
      case "partners-events":
        if (
          Array.isArray(cat) &&
          cat.length > 0 &&
          cat[0].slug !== "partners-events"
        ) {
          count--;
          return false;
        }
        return 1;
      default:
        return 1;
    }
  });
  //console.log("events", events);
  let listEvents = events.map((v, key) => <EventDiv key={key} event={v} />);
  //console.log(state);
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
      <div className="DayPicker-filter">
        <div className="DayPicker-filter__select">
          <select value={state.select.type} onChange={handleSelectType}>
            <option value="all-events">Все мероприятия</option>
            <option value="russoft-events">Мероприятия РУССОФТ</option>
            <option value="partners-events">Мероприятия партнеров</option>
          </select>

          <select value={state.select.period} onChange={handleSelectPeriod}>
            <option value="all-period">За все время</option>
            <option value="last-week">На неделю</option>
            <option value="last-month">На месяц</option>
            <option value="last-half-year">На полгода</option>
            <option value="last-year">На год</option>
          </select>
        </div>
        {/* !range.from && !range.to && "Please select the first day." */}
        {/* range.from && !range.to && "Please select the last day." */}
        {/* range.from &&
          range.to &&
          `Selected from ${range.from.toLocaleDateString()} to
        ${range.to.toLocaleDateString()}` */}
        <div className="DayPicker-filter__clear-button">
          <button className="link" onClick={handleResetClick}>
            Очистить фильтр
          </button>
        </div>
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
