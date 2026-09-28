import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
//https://docs.expo.dev/versions/latest/sdk/sqlite/
import * as SQLite from "expo-sqlite";

let db;

export default function App() {
  const [SQLiteData, setSQLiteData] = useState([]);
  const [SQLitePermData, setSQLitePermData] = useState([]);
  const [varde, setVarde] = useState("");
  const [intVarde, setIntVarde] = useState(0);

  useEffect(() => {
    openDB();
  }, []);
  /*useEffect(() => {
    readData();
  }, [SQLiteData]);*/

  const readData = async () => {
    let tabelData = [];
    const allRows = await db.getAllAsync("SELECT * FROM test");
    for (const row of allRows) {
      console.log(row.id, row.value, row.intValue);
      //console.log(row);
      tabelData.push(row);
    }
    setSQLiteData(tabelData);
  };

  const writeData = async () => {
    //console.log(varde, intVarde);
    if (varde !== "" || intVarde !== 0) {
      const result = await db.execAsync(
        "INSERT INTO test (value, intValue) VALUES ('" + varde + "', " + intVarde + ")"
      );
    }
    //console.log(result.lastInsertRowId, result.changes);
    readData();
  };

  const deleteLastRow = async () => {
    const result = await db.execAsync("DELETE FROM test WHERE id = (SELECT MAX(id) FROM test)");
    console.log("deleteLastRow:", result);
    //console.log("deleteLastRow:", result.lastInsertRowId, result.changes);
    readData();
  };

  const deleteLastRowPerm = async () => {
    const result = await db.execAsync("DELETE FROM test_perm WHERE id = (SELECT MAX(id) FROM test_perm)");
    console.log("deleteLastRow:", result);
    readPermData();
  };

  const moveData = async () => {
    console.log("Move data from Temp to Perm");
    const allRows = await db.getAllAsync("SELECT * FROM test");
    for (const row of allRows) {
      console.log(row.id, row.value, row.intValue);
      console.log("row:", row);
      const result = await db.execAsync(
        "INSERT INTO test_perm (value, intValue) VALUES ('" + row.value + "', " + row.intValue + ")"
      );
      console.log(result);
      const resultDelete = await db.execAsync("DELETE FROM test WHERE id = " + row.id);
      console.log("delete", resultDelete);
    }
    readData();
    readPermData();
  };

  const readPermData = async () => {
    let tabelData = [];
    const allRows = await db.getAllAsync("SELECT * FROM test_perm");
    for (const row of allRows) {
      console.log(row.id, row.value, row.intValue);
      //console.log(row);
      tabelData.push(row);
    }
    setSQLitePermData(tabelData);
  };

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <TextInput style={{ height: 40 }} placeholder="Skriv text" onChangeText={(varde) => setVarde(varde)} />
      <TextInput
        inputMode="numeric"
        style={{ height: 40 }}
        placeholder="Skriv siffra"
        onChangeText={(intVarde) => setIntVarde(intVarde)}
      />
      <Button title="Write Data in Temp" onPress={writeData} />
      <Button title="Read Data in Temp" onPress={readData} />
      <Button title="Delete Last Row in Temp" onPress={deleteLastRow} />
      <Text>Temp database:</Text>
      {SQLiteData.map((item, index) => {
        return (
          <View key={index}>
            <Text>
              {item.id}, {item.value}, {item.intValue}
            </Text>
          </View>
        );
      })}
      {/* <Text>{JSON.stringify(SQLiteData)}</Text>  */}
      <Button title="Move Data from Temp to Perm" onPress={moveData} />
      <Button title="Read Data in Perm" onPress={readPermData} />
      <Button title="Delete Last Row in Perm" onPress={deleteLastRowPerm} />
      <Text>Perm database:</Text>
      {SQLitePermData.map((item, index) => {
        return (
          <View key={index}>
            <Text>
              {item.id}, {item.value}, {item.intValue}
            </Text>
          </View>
        );
      })}
      <StatusBar style="auto" />
    </View>
  );
}

const openDB = async () => {
  db = await SQLite.openDatabaseAsync("databaseName");
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL, intValue INTEGER);
    `);
  await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS test_perm (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL, intValue INTEGER);
      `);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
