var app = new Vue({
  el: "#app",
  data() {
    return {
      senadores: [],
      house: [],
      showReadMore: false
    };
  },
  created() {
    fetch("https://api.propublica.org/congress/v1/113/senate/members.json", {
      headers: {
        "X-API-Key": "dmHrSTCa94o2SeU3wo9Rc6Z8tDADMCzzDg3CFzIA"
      }
    }).then(response => {
      response.json().then(dataSenado => {
        this.senadores = dataSenado.results[0].members;
      });
    });

    fetch("https://api.propublica.org/congress/v1/113/house/members.json", {
      headers: {
        "X-API-Key": "dmHrSTCa94o2SeU3wo9Rc6Z8tDADMCzzDg3CFzIA"
      }
    }).then(response => {
      response.json().then(dataHouse => {
        this.house = dataHouse.results[0].members;
      });
    });
  },
  methods: {
    showReadMoreMethods() {
      this.showReadMore = !this.showReadMore;
    },
    
    // crea tabla {partido}at a glance
    glance(data) {
      let contRepu = 0;
      let SumRepu = 0;
      let contDemo = 0;
      let SumDemo = 0;
      let contInd = 0;
      let SumIndepent = 0;
      data.map(element => {
        if (element.party == "D") {
          contDemo++;
          SumDemo += element.votes_with_party_pct;
        }
        if (element.party == "R") {
          contRepu++;
          SumRepu += element.votes_with_party_pct;
        }
        if (element.party == "I") {
          contInd++;
          SumIndepent += element.votes_with_party_pct;
        }
      });
      return [
        {
          nombrePartido: "Democrats",
          canPartido: contDemo,
          promedio: (SumDemo / contDemo).toFixed(2) || 0
        },
        {
          nombrePartido: "Republicans",
          canPartido: contRepu,
          promedio: (SumRepu / contRepu).toFixed(2) || 0
        },
        {
          nombrePartido: "Independents",
          canPartido: contInd,
          promedio:
            SumIndepent / contInd ? (SumIndepent / contInd).toFixed(2) : 0
        },
        {
          nombrePartido: "Total",
          canPartido: contDemo + contRepu + contInd,
          promedio: (SumRepu / contRepu + SumDemo / contDemo).toFixed(2)
        }
      ];
    },

    /* crea Least Engaged (Bottom 10% Attendance) , Most Engaged (Top 10% Attendance) , 
       Least Loyal (Bottom 10% of Party), Most Loyal (Top 10% of Party) */
    LeastMostLoyal(data, isMissed) {
      const menosVotan = [];
      const loyaltyVotan = [];
      let pctBottomMissedVotes = [];
      let pctTopMissedVotes = [];
      let pctBottomLoyaltyVotes = [];
      let pctTopLoyaltyVotes = [];

      // carga arreglo para attendance y loyalty
      data.map(element => {
        const votes = {
          url: element.url,

          name: ` ${element.first_name}
          ${element.middle_name != null ? element.middle_name : ""}
          ${element.last_name}`,

          votes: isMissed ? element.missed_votes : element.votes_with_party_pct,

          pctVotes: isMissed
            ? ((element.missed_votes * 100) / element.total_votes || 0).toFixed(2)
            : ((element.votes_with_party_pct * 100) / element.total_votes || 0).toFixed(2)
        };

        menosVotan.push(votes);
        loyaltyVotan.push(votes);
      });
      // ordena los arreglos
      menosVotan.sort((a, b) => {
        return a.votes - b.votes;
      });
      loyaltyVotan.sort((a, b) => {
        return a.votes - b.votes;
      });

      // crea arreglos con el 10%
      pctBottomMissedVotes = menosVotan.slice(data.length * 0.9, data.length).reverse();
      pctTopMissedVotes = menosVotan.slice(0, data.length * 0.1);

      pctBottomLoyaltyVotes = loyaltyVotan.slice(data.length * 0.9, data.length).reverse();
      pctTopLoyaltyVotes = loyaltyVotan.slice(0, data.length * 0.1);
 
      // retorna un objeto con datos para cargar las 4 tablas.
      return {
        bottomAtendance: pctBottomMissedVotes,
        topAttendance: pctTopMissedVotes,
        bottomLoyalty: pctBottomLoyaltyVotes,
        topLoyalty: pctTopLoyaltyVotes
      };
    }
  }
});
