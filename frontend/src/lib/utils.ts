import moment from "moment";

export const getAge = (timestamp: number) => {
  const now = moment();
  const then = moment(timestamp * 1000);
  const duration = moment.duration(now.diff(then));

  const age = {
    years: duration.years(),
    months: duration.months(),
    days: duration.days(),
    hours: duration.hours(),
    minutes: duration.minutes(),
    seconds: duration.seconds(),
  };

  let formattedAge = "";
  let count = 0;
  const precise = 2;
  // Get and print both keys and values
  Object.entries(age).forEach(([key, value]) => {
    if (count >= precise) return;
    if (value > 0) {
      formattedAge += `${value} ${key} `;
      count += 1;
    }
  });

  return formattedAge.length > 0 ? formattedAge : "Just now";
};

export const standardUnit = (count: number) => {
  const score: number = count / 1000;
  return score > 1 ? `${score}K` : `${count}`;
};

export const convertHex = (hex: string) => {
  return parseInt(hex, 16).toString(16);
};

export const converBaseUnit = (amount: number, decimals: number) => {
  return (Math.abs(amount) / 10 ** decimals).toFixed(5);
};
