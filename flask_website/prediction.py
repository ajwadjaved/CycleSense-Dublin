import pickle


class Prediction:
    def test(self, station: int):
        with open("model_" + station + ".pkl", 'rb') as file:
            model = pickle.load(file)

        pred = model.predict()