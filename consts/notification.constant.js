const Notification_Types = {
  Event: "Event",
  Tvradio: "Tvradio",
  Material: "Material",
  News: "News",
  Album: "Album",
  Artist: "Artist",
  General: "General",
};

const Notification_Types_Enum = [
  Notification_Types.Event,
  Notification_Types.Tvradio,
  Notification_Types.Material,
  Notification_Types.News,
  Notification_Types.Album,
  Notification_Types.Artist,
  Notification_Types.General,
];
const Notification_Types_List = [
  Notification_Types.Event,
  Notification_Types.Tvradio,
  Notification_Types.Material,
  Notification_Types.News,
  Notification_Types.Album,
  Notification_Types.Artist,
  Notification_Types.General,
];

const Notification_Target_Types = {
  News: "news",
  Material: "material",
  Album: "album",
  Radio: "radio",
  Artist: "artist",
  Article: "article",
  Event: "event",
};

const Notification_Target_Types_Enum = [
  Notification_Target_Types.News,
  Notification_Target_Types.Material,
  Notification_Target_Types.Album,
  Notification_Target_Types.Radio,
  Notification_Target_Types.Artist,
  Notification_Target_Types.Article,
  Notification_Target_Types.Event,
];

module.exports = {
  Notification_Constants: {
    Notification_Types: Notification_Types,
    Notification_Types_Enum: Notification_Types_Enum,
    Notification_Types_List: Notification_Types_List,
    Notification_Target_Types: Notification_Target_Types,
    Notification_Target_Types_Enum: Notification_Target_Types_Enum,
  },
};
