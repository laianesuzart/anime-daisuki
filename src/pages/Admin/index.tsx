import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Select } from "antd";
import { SelectValue } from "antd/lib/select";
import { toast } from "react-hot-toast";
import { IoMdRefresh } from "react-icons/io";
import Header from "../../components/Header";
import Button from "../../components/Button";
import InputText from "../../components/InputText";
import InputFile from "../../components/InputFile";
import {
  Container,
  Box,
  CheckboxStyled,
  SelectStyled,
  FormStyled,
  FormMod,
  Wrapper,
  TextArea,
  AddEpTitle,
} from "./styles";
import { useUser } from "../../hooks/User";
import { InputTypes } from "../../model/enums/input-types";
import { FormAnime, FormEpisode, FormModerator } from "../../model/admin-forms";
import { daisukiApi } from "../../services/api";
import { genres as allGenres } from "../../shared/util/genre-utils";
import SchemaUtils from "../../shared/util/schema-utils";

const Admin = () => {
  const [genres, setGenres] = useState<SelectValue | any>([]);
  const [isDubbed, setIsDubbed] = useState(false);
  const [isMovie, setIsMovie] = useState(false);
  const [synopsis, setSynopsis] = useState<string>("");
  const [animeList, setAnimeList] = useState<string[]>([]);
  const [anime, setAnime] = useState<SelectValue>("");

  const { token } = useUser();

  const getAnimeList = () => {
    daisukiApi
      .get("/animes/upload-list")
      .then((res) => setAnimeList(res.data))
      .catch((err) => console.log(err));
  };

  const methodsAnime = useForm({
    resolver: yupResolver(SchemaUtils.anime()),
    mode: "all",
  });

  const methodsEpisode = useForm({
    resolver: yupResolver(SchemaUtils.episode()),
    mode: "all",
  });

  const methodsModerator = useForm({
    resolver: yupResolver(SchemaUtils.moderator()),
    mode: "all",
  });

  const onSubmitAnime = (data: FormAnime) => {
    if (!genres[0]) {
      return toast.error("Selecione ao menos um gênero");
    }

    const animeFormData = new FormData();

    animeFormData.append("name", data.name);
    animeFormData.append("synopsis", synopsis.replaceAll(/"/g, "'"));
    animeFormData.append(
      "totalEpisodes",
      isMovie ? "1" : String(data.totalEpisodes)
    );
    animeFormData.append("isDubbed", isDubbed ? "true" : "");
    animeFormData.append("isMovie", isMovie ? "true" : "");
    animeFormData.append("genres", genres.join(","));
    if (data.image[0]) {
      animeFormData.append("image", data.image[0], data.image[0].name);
    }

    async function fetch() {
      await daisukiApi.post("/animes", animeFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
    }
    const myPromise = fetch();
    toast.promise(
      myPromise,
      {
        loading: "Enviando...",
        success: "Anime adicionado!",
        error: "Tente novamente =c",
      },
      {
        style: {
          minWidth: "200px",
        },
      }
    );
  };

  const onSubmitEpisode = (data: any) => {
    console.log(data);

    if (!anime) {
      return toast.error("Selecione um anime");
    }

    const output = {
      anime: anime,
      episodeNumber: data.episodeNumber,
      videoUrl: data.videoUrl,
      image: data.image,
    };

    // async function fetch() {
    //   await daisukiApi.post("/animes", animeFormData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //       Authorization: `Bearer ${token}`,
    //     },
    //   });
    // }
    // const myPromise = fetch();
    // toast.promise(
    //   myPromise,
    //   {
    //     loading: "Enviando...",
    //     success: "Anime adicionado!",
    //     error: "Tente novamente =c",
    //   },
    //   {
    //     style: {
    //       minWidth: "200px",
    //     },
    //   }
    // );
  };

  const onSubmitModerator = (data: FormModerator) => {
    console.log(data);
    const output = {
      email: data.email,
    };
    console.log(output);
  };

  const { Option } = Select;

  useEffect(() => {
    getAnimeList();
  }, []);

  return (
    <>
      <Header />
      <Container>
        <Box>
          <h2>Adicionar anime:</h2>
          <FormProvider {...methodsAnime}>
            <FormStyled
              onSubmit={methodsAnime.handleSubmit(onSubmitAnime)}
              autoComplete="off"
            >
              <InputText
                name="name"
                placeholder="Nome do anime"
                label="Nome do anime*"
                type={InputTypes.TEXT}
              />
              <TextArea>
                <label htmlFor="synopsis">Sinopse*</label>
                <textarea
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  name="synopsis"
                  id="synopsis"
                  cols={30}
                  rows={6}
                  placeholder=" Uma sinopse bem legal..."
                  maxLength={1023}
                />
              </TextArea>
              <CheckboxStyled
                name="isMovie"
                onChange={(e) => setIsMovie(e.target.checked)}
              >
                Filme
              </CheckboxStyled>
              <InputText
                name="totalEpisodes"
                placeholder="12"
                label="Total de episódios*"
                type={InputTypes.TEXT}
                disabled={isMovie}
                maxWidth="120px"
              />
              <CheckboxStyled
                name="isDubbed"
                onChange={(e) => setIsDubbed(e.target.checked)}
              >
                Dublado
              </CheckboxStyled>
              <SelectStyled
                placeholder="Selecione os gêneros"
                mode="multiple"
                onChange={(e) => setGenres(e)}
              >
                {allGenres.map((genre) => (
                  <Option name={genre} value={genre} key={genre}>
                    {genre}
                  </Option>
                ))}
              </SelectStyled>
              <Wrapper>
                <InputFile name="image" />
                <Button text="Enviar" />
              </Wrapper>
            </FormStyled>
          </FormProvider>
        </Box>
        <Box>
          <AddEpTitle>
            Adicionar episódio:
            <IoMdRefresh title="Atualizar animes" onClick={getAnimeList} />
          </AddEpTitle>
          <FormProvider {...methodsEpisode}>
            <FormStyled
              onSubmit={methodsEpisode.handleSubmit(onSubmitEpisode)}
              autoComplete="off"
            >
              <SelectStyled
                placeholder="Selecione o anime"
                onChange={(e) => setAnime(e)}
              >
                {animeList?.map((anime, index) => (
                  <Option name={anime} value={anime} key={index}>
                    {anime}
                  </Option>
                ))}
              </SelectStyled>
              <InputText
                name="episodeNumber"
                placeholder="1"
                label="Número*"
                type={InputTypes.TEXT}
                maxWidth="120px"
              />
              <InputText
                name="videoUrl"
                placeholder="https://streamable.com/z8xs0a"
                label="Vídeo url*"
                type={InputTypes.TEXT}
              />
              <Wrapper>
                <InputFile name="image" />
                <Button text="Enviar" />
              </Wrapper>
            </FormStyled>
          </FormProvider>
        </Box>
        <Box>
          <h2>Adicionar moderador:</h2>
          <FormProvider {...methodsModerator}>
            <FormMod
              onSubmit={methodsModerator.handleSubmit(onSubmitModerator)}
              autoComplete="off"
            >
              <InputText
                name="email"
                placeholder="exemplo@mail.com"
                label="Email*"
                type={InputTypes.EMAIL}
              />
              <Button text="Enviar" margin="0.5rem 0 0.5rem 8px" />
            </FormMod>
          </FormProvider>
        </Box>
        <Button text="Ver moderadores" />
      </Container>
    </>
  );
};

export default Admin;
